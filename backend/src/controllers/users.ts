import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../config/firebase";

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const doc = await db.collection("users").doc(req.userId!).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getUserPurchases(req: AuthRequest, res: Response) {
  try {
    const snapshot = await db
      .collection("purchases")
      .where("userId", "==", req.userId!)
      .orderBy("createdAt", "desc")
      .get();

    const purchases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ purchases });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function checkMembership(req: AuthRequest, res: Response) {
  try {
    const userDoc = await db.collection("users").doc(req.userId!).get();
    const userData = userDoc.data();
    return res.json({
      isMember: userData?.isMember || false,
      memberSince: userData?.memberSince || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
