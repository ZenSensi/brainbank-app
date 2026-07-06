import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getContentBySemester,
  getContentBySpecialization,
  getContentById,
  searchContent,
  getFreeVideos,
} from "../controllers/content";

const router = Router();

router.get("/semester/:semester", authenticate, getContentBySemester);
router.get("/specialization/:specialization", authenticate, getContentBySpecialization);
router.get("/search", authenticate, searchContent);
router.get("/videos", getFreeVideos);
router.get("/:id", authenticate, getContentById);

export default router;
