import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../config/firebase";

export async function getContentBySemester(req: AuthRequest, res: Response) {
  try {
    const semester = String(req.params.semester);
    const snapshot = await db
      .collection("content")
      .where("semester", "==", Number(semester))
      .orderBy("createdAt", "desc")
      .get();

    const content = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ content });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getContentBySpecialization(req: AuthRequest, res: Response) {
  try {
    const specialization = String(req.params.specialization);
    const snapshot = await db
      .collection("content")
      .where("specialization", "==", specialization)
      .orderBy("createdAt", "desc")
      .get();

    const content = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ content });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getContentById(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const doc = await db.collection("content").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Content not found" });
    }

    return res.json({ content: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function searchContent(req: AuthRequest, res: Response) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const term = q.toLowerCase();
    const snapshot = await db.collection("content").orderBy("createdAt", "desc").limit(50).get();

    const content = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) =>
        item.title?.toLowerCase().includes(term) ||
        item.subjectName?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );

    return res.json({ content });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getFreeVideos(_req: AuthRequest, res: Response) {
  try {
    const snapshot = await db
      .collection("content")
      .where("type", "==", "video")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const videos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ videos });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
