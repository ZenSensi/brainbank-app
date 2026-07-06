import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getUserProfile, getUserPurchases, checkMembership } from "../controllers/users";

const router = Router();

router.get("/profile", authenticate, getUserProfile);
router.get("/purchases", authenticate, getUserPurchases);
router.get("/membership", authenticate, checkMembership);

export default router;
