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

export interface Purchase {
  id?: string;
  userId: string;
  contentId?: string;
  type: "notes" | "pyq" | "membership";
  amount: number;
  status: "completed" | "pending" | "failed";
  paymentId: string;
  createdAt: number;
}

export interface ContentItem {
  id?: string;
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
  youtubePlaylistId?: string;
  isLocked: boolean;
  downloadCount: number;
  createdAt: number;
  updatedAt: number;
}
