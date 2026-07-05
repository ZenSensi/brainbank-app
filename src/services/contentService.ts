import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../constants/firebase";
import { ContentItem } from "../types";

const contentRef = collection(db, "content");

export async function getContentBySemester(semester: number): Promise<ContentItem[]> {
  const q = query(
    contentRef,
    where("semester", "==", semester),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}

export async function getContentBySpecialization(specialization: string): Promise<ContentItem[]> {
  const q = query(
    contentRef,
    where("specialization", "==", specialization),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const d = await getDoc(doc(db, "content", id));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as ContentItem;
}

export async function getContentBySubject(subjectId: string): Promise<ContentItem[]> {
  const q = query(
    contentRef,
    where("subjectId", "==", subjectId),
    orderBy("type", "asc"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}

export async function searchContent(searchTerm: string): Promise<ContentItem[]> {
  const q = query(contentRef, orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
  const term = searchTerm.toLowerCase();
  return all.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      item.subjectName.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
  );
}

export async function getFreeVideos(): Promise<ContentItem[]> {
  const q = query(
    contentRef,
    where("type", "==", "video"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}

export async function getRecentContent(): Promise<ContentItem[]> {
  const q = query(contentRef, orderBy("createdAt", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}

export async function getAllContent(): Promise<ContentItem[]> {
  const q = query(contentRef, orderBy("createdAt", "desc"), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem));
}
