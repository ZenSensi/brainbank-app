import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { razorpay } from "../config/razorpay";
import admin, { db } from "../config/firebase";
const crypto = require("crypto");

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { contentId, amount, type } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }

    if (!contentId && (!type || type === "membership")) {
      return res.status(400).json({ error: "contentId is required for content orders" });
    }

    // Fetch user details from firebase admin to prefill name and phone
    const userDoc = await db.collection("users").doc(req.userId!).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      description: type === "pyq" ? "Purchase BCA PYQ Paper" : "Purchase BCA Notes",
      customer: {
        name: userData?.displayName || "Student",
        contact: userData?.phone || "",
        email: userData?.email || "student@brainbank.app",
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        userId: req.userId!,
        contentId: contentId || "",
        type: type || "notes",
      },
      callback_url: `https://${req.get("host")}/api/payments/callback`,
      callback_method: "get",
    });

    return res.json({
      orderId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
    });
  } catch (error: any) {
    console.error("Create payment link error:", error);
    return res.status(500).json({ error: error.message || "Failed to create payment link" });
  }
}

export async function createMembershipOrder(req: AuthRequest, res: Response) {
  try {
    const userDoc = await db.collection("users").doc(req.userId!).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const paymentLink = await razorpay.paymentLink.create({
      amount: 199 * 100, // ₹199
      currency: "INR",
      accept_partial: false,
      description: "Brain Bank Lifetime Membership",
      customer: {
        name: userData?.displayName || "Student",
        contact: userData?.phone || "",
        email: userData?.email || "student@brainbank.app",
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        userId: req.userId!,
        type: "membership",
      },
      callback_url: `https://${req.get("host")}/api/payments/callback`,
      callback_method: "get",
    });

    return res.json({
      orderId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
    });
  } catch (error: any) {
    console.error("Create membership payment link error:", error);
    return res.status(500).json({ error: error.message || "Failed to create payment link" });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const userId = req.userId!;
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const notes = payment.notes;

    if (notes?.type === "membership") {
      await db.collection("users").doc(userId).update({
        isMember: true,
        memberSince: Date.now(),
      });

      await db.collection("purchases").add({
        userId,
        type: "membership",
        amount: (Number(payment.amount) || 10000) / 100,
        status: "completed",
        paymentId: razorpay_payment_id,
        createdAt: Date.now(),
      });
    } else if (notes?.contentId) {
      const purchaseType = notes.type === "pyq" ? "pyq" : "notes";

      await db.collection("purchases").add({
        userId,
        contentId: notes.contentId,
        type: purchaseType,
        amount: (Number(payment.amount) || 2000) / 100,
        status: "completed",
        paymentId: razorpay_payment_id,
        createdAt: Date.now(),
      });

      await db.collection("content").doc(notes.contentId).update({
        downloadCount: admin.firestore.FieldValue.increment(1),
      });
    } else {
      return res.status(400).json({ error: "Unknown purchase type" });
    }

    return res.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify payment" });
  }
}

export async function handleWebhook(req: any, res: Response) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "brainbank_webhook_secret";

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("Webhook verification failed: signature mismatch");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    console.log(`Webhook received event: ${event}`);

    if (event === "payment_link.paid" || event === "payment.captured") {
      const paymentEntity = event === "payment_link.paid"
        ? req.body.payload.payment_link.entity
        : req.body.payload.payment.entity;

      const notes = paymentEntity.notes;
      const paymentId = event === "payment_link.paid"
        ? req.body.payload.payment.entity.id
        : paymentEntity.id;

      if (!notes || !notes.userId) {
        console.warn("Webhook: Metadata 'userId' missing in notes");
        return res.json({ status: "skipped", reason: "missing notes metadata" });
      }

      const userId = notes.userId;

      if (notes.type === "membership") {
        await db.collection("users").doc(userId).update({
          isMember: true,
          memberSince: Date.now(),
        });

        const purchaseSnap = await db.collection("purchases")
          .where("userId", "==", userId)
          .where("type", "==", "membership")
          .get();

        if (purchaseSnap.empty) {
          await db.collection("purchases").add({
            userId,
            type: "membership",
            amount: paymentEntity.amount / 100,
            status: "completed",
            paymentId: paymentId,
            createdAt: Date.now(),
          });
        }
        console.log(`Webhook: Membership activated for user ${userId}`);
      } else if (notes.contentId) {
        const purchaseType = notes.type === "pyq" ? "pyq" : "notes";

        const purchaseSnap = await db.collection("purchases")
          .where("userId", "==", userId)
          .where("contentId", "==", notes.contentId)
          .get();

        if (purchaseSnap.empty) {
          await db.collection("purchases").add({
            userId,
            contentId: notes.contentId,
            type: purchaseType,
            amount: paymentEntity.amount / 100,
            status: "completed",
            paymentId: paymentId,
            createdAt: Date.now(),
          });

          await db.collection("content").doc(notes.contentId).update({
            downloadCount: admin.firestore.FieldValue.increment(1),
          });
        }
        console.log(`Webhook: Content ${notes.contentId} unlocked for user ${userId}`);
      }
    }

    return res.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message || "Webhook failed" });
  }
}

export async function paymentCallback(req: any, res: Response) {
  // Mobile browsers sometimes block direct custom scheme redirects, 
  // so we serve a simple HTML page that auto-redirects.
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Successful</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; background: #f8f9fa; }
          .btn { display: inline-block; padding: 12px 24px; background: #674bb5; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div>
          <h2>Payment Completed! 🎉</h2>
          <p>You can now return to the app.</p>
          <a href="brainbank://" class="btn">Return to Brain Bank</a>
        </div>
        <script>
          setTimeout(() => { window.location.href = "brainbank://"; }, 500);
        </script>
      </body>
    </html>
  `);
}

export async function createUpiOrder(req: AuthRequest, res: Response) {
  try {
    const { contentId, amount, type } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }

    if (!contentId && (!type || type === "membership")) {
      return res.status(400).json({ error: "contentId is required for content orders" });
    }

    const upiId = process.env.UPI_ID || "brainbank@okaxis";
    const upiName = process.env.UPI_NAME || "Brain Bank";

    // Generate a unique transaction reference ID
    const transactionId = "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const userId = req.userId!;
    const purchaseType = type === "pyq" ? "pyq" : type === "membership" ? "membership" : "notes";

    // Save initial pending purchase record in Firestore
    const purchaseData: any = {
      userId,
      amount: Number(amount),
      status: "pending",
      paymentId: transactionId,
      createdAt: Date.now(),
      type: purchaseType,
    };

    if (purchaseType !== "membership" && contentId) {
      purchaseData.contentId = contentId;
    }

    await db.collection("purchases").add(purchaseData);

    // Format the standard upi://pay intent URL
    const encodedName = encodeURIComponent(upiName);
    const description = purchaseType === "membership"
      ? "Brain Bank Lifetime Membership"
      : purchaseType === "pyq"
        ? "Purchase BCA PYQ Paper"
        : "Purchase BCA Notes";
    const encodedDesc = encodeURIComponent(description);

    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedDesc}&tr=${transactionId}`;

    return res.json({
      transactionId,
      upiUrl,
      amount,
      currency: "INR",
    });
  } catch (error: any) {
    console.error("Create UPI order error:", error);
    return res.status(500).json({ error: error.message || "Failed to create UPI order" });
  }
}

export async function verifyUpiPayment(req: AuthRequest, res: Response) {
  try {
    const { transactionId, utr } = req.body;

    if (!transactionId || !utr) {
      return res.status(400).json({ error: "transactionId and utr are required" });
    }

    // Validate UTR is exactly 12 digits
    if (!/^\d{12}$/.test(utr)) {
      return res.status(400).json({ error: "Invalid UTR format. Must be a 12-digit number." });
    }

    // Find pending transaction in Firestore
    const purchasesSnap = await db.collection("purchases")
      .where("paymentId", "==", transactionId)
      .where("userId", "==", req.userId!)
      .get();

    if (purchasesSnap.empty) {
      return res.status(404).json({ error: "Transaction reference not found" });
    }

    const purchaseDoc = purchasesSnap.docs[0];
    const purchaseData = purchaseDoc.data();

    if (purchaseData.status === "completed") {
      return res.json({ success: true, status: "completed", message: "Purchase already completed." });
    }

    // Read auto-approve setting
    const autoApprove = process.env.AUTO_APPROVE_UPI !== "false";
    const targetStatus = autoApprove ? "completed" : "pending_verification";

    await purchaseDoc.ref.update({
      status: targetStatus,
      utr: utr,
      paymentId: utr, // Swap transactionId for verified UTR
      submittedAt: Date.now(),
      ...(autoApprove ? { completedAt: Date.now() } : {})
    });

    if (targetStatus === "completed") {
      const userId = req.userId!;
      
      if (purchaseData.type === "membership") {
        await db.collection("users").doc(userId).update({
          isMember: true,
          memberSince: Date.now(),
        });
        console.log(`UPI: Membership activated for user ${userId} via UTR ${utr}`);
      } else if (purchaseData.contentId) {
        await db.collection("purchases").doc(purchaseDoc.id).update({
          status: "completed"
        });
        
        await db.collection("content").doc(purchaseData.contentId).update({
          downloadCount: admin.firestore.FieldValue.increment(1),
        });
        console.log(`UPI: Content ${purchaseData.contentId} unlocked for user ${userId} via UTR ${utr}`);
      }
    }

    return res.json({
      success: true,
      status: targetStatus,
      message: autoApprove
        ? "Payment verified and unlocked successfully!"
        : "Payment submitted. Your purchase will be unlocked once approved by our admin."
    });
  } catch (error: any) {
    console.error("Verify UPI payment error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify UPI payment" });
  }
}

