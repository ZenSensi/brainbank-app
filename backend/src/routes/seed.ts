import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { seedContent } from "../controllers/seed";

const router = Router();

router.post("/content", authenticate, seedContent);

export default router;
