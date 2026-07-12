import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { 
  createOrder, 
  verifyPayment, 
  createMembershipOrder, 
  handleWebhook, 
  paymentCallback,
  createUpiOrder,
  verifyUpiPayment
} from "../controllers/payments";

const router = Router();

router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.post("/create-membership-order", authenticate, createMembershipOrder);
router.post("/webhook", handleWebhook);
router.get("/callback", paymentCallback);

// Custom Direct UPI routes
router.post("/create-upi-order", authenticate, createUpiOrder);
router.post("/verify-upi", authenticate, verifyUpiPayment);

export default router;

