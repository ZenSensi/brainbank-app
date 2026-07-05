import { collection, query, where, getDocs, addDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../constants/firebase";
import { Purchase } from "../types";

const purchasesRef = collection(db, "purchases");

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const q = query(purchasesRef, where("userId", "==", userId), where("status", "==", "completed"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Purchase));
}

export async function isContentPurchased(userId: string, contentId: string): Promise<boolean> {
  const q = query(
    purchasesRef,
    where("userId", "==", userId),
    where("contentId", "==", contentId),
    where("status", "==", "completed")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function savePurchase(purchase: Omit<Purchase, "id">): Promise<string> {
  const docRef = await addDoc(purchasesRef, {
    ...purchase,
    createdAt: Timestamp.now().toMillis(),
  });
  return docRef.id;
}

export async function grantMembership(userId: string, paymentId: string): Promise<void> {
  await setDoc(doc(db, "users", userId), {
    isMember: true,
    memberSince: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
  }, { merge: true });
}

export async function checkMembershipStatus(userId: string): Promise<boolean> {
  const q = query(
    purchasesRef,
    where("userId", "==", userId),
    where("type", "==", "membership"),
    where("status", "==", "completed")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
