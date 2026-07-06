import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createOrder, verifyPayment, createMembershipOrder, handleWebhook, paymentCallback } from "../controllers/payments";

const router = Router();

router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.post("/create-membership-order", authenticate, createMembershipOrder);
router.post("/webhook", handleWebhook);
router.get("/callback", paymentCallback);

export default router;
