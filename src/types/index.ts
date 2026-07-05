export interface User {
  id: string;
  phone: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  isMember: boolean;
  memberSince?: number;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  semester: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "notes" | "pyq" | "video";
  subjectId: string;
  subjectName: string;
  semester?: number;
  specialization?: string;
  price: number;
  thumbnailUrl: string;
  fileUrl?: string;
  url?: string;
  youtubePlaylistId?: string;
  isLocked: boolean;
  downloadCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Purchase {
  id: string;
  userId: string;
  contentId?: string;
  type: "notes" | "pyq" | "membership";
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentId: string;
  createdAt: number;
}

export interface Semester {
  id: number;
  name: string;
  subjects: Subject[];
}

export interface ContentCategory {
  id: string;
  title: string;
  type: "semester" | "specialization";
  data: Semester | Specialization;
}
