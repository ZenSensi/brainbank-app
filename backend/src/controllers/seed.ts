import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../config/firebase";

const SUBJECTS = [
  { 
    id: "c-programming", 
    name: "C Programming", 
    semester: 1, 
    icon: "⚙️", 
    color: "#4A90D9",
    thumbnailUrl: "https://images.unsplash.com/photo-1627390496243-10e12253d544?w=500&q=80" 
  },
  { 
    id: "python", 
    name: "Python", 
    semester: 1, 
    icon: "🐍", 
    color: "#3572A5",
    thumbnailUrl: "https://images.unsplash.com/photo-1649180556628-9ba704115795?w=500&q=80" 
  },
  { 
    id: "java", 
    name: "Java", 
    semester: 2, 
    icon: "☕", 
    color: "#B07219",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80" 
  },
  { 
    id: "html", 
    name: "HTML", 
    semester: 1, 
    icon: "🌐", 
    color: "#E34F26",
    thumbnailUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=500&q=80" 
  },
  { 
    id: "css", 
    name: "CSS", 
    semester: 1, 
    icon: "🎨", 
    color: "#1572B6",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80" 
  },
  { 
    id: "javascript", 
    name: "JavaScript", 
    semester: 2, 
    icon: "📜", 
    color: "#F7DF1E",
    thumbnailUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&q=80" 
  },
  { 
    id: "sql", 
    name: "SQL", 
    semester: 3, 
    icon: "🗄️", 
    color: "#CC2927",
    thumbnailUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80" 
  },
  { 
    id: "git", 
    name: "Git & GitHub", 
    semester: 3, 
    icon: "🔀", 
    color: "#F05032",
    thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&q=80" 
  },
];

const FREE_PLAYLISTS = [
  {
    title: "Full Web Development",
    description: "Master React, Node, Express & MongoDB - Full Stack Course",
    subjectId: "web-dev",
    subjectName: "Web Development",
    specialization: "web-dev",
    youtubePlaylistId: "PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w",
    thumbnailUrl: "https://images.unsplash.com/photo-1547658719-da2b81169b7a?w=800&q=80",
    isLocked: false,
  },
  {
    title: "AI & Machine Learning",
    description: "Stanford CS221 - Artificial Intelligence Principles and Techniques",
    subjectId: "ai-ml",
    subjectName: "Artificial Intelligence",
    specialization: "ai-ml",
    youtubePlaylistId: "PLoROMvodv4rOca_Ovz1Dv9W9GcY8U0q9x",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80",
    isLocked: false,
  },
  {
    title: "Cyber Security",
    description: "Full Cyber Security Masterclass 2024 - Network Security & Ethical Hacking",
    subjectId: "cybersecurity",
    subjectName: "Cyber Security",
    specialization: "cybersecurity",
    youtubePlaylistId: "PLG49d1gldJHdvXQPR0ESbo7pOPFZQpLx0",
    thumbnailUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    isLocked: false,
  },
];

const DRIVE_IDS: Record<string, string> = {
  python: "1qhfEIJecYBUsWj3252MoUgf_fk-sPZoD",
  java: "1Pzw6YQSNj--BD4egZ1NtrLkF6j6fN1I8",
  html: "1uEuLGPtPwanb2IgPXmKa8dJIdzzWv8xP",
  css: "168Lx-_kx8NpnsdoRc7hD0xKvzsglNErs",
  javascript: "1RLRhRnbYdZ7G1HRlLpxkSOi3HEqgmshj",
  sql: "1f7pJZFZUkuHiiyYSIxBAgSycI8W2w2AX"
};

export async function seedContent(req: AuthRequest, res: Response) {
  try {
    const now = Date.now();
    let created = 0;

    for (const subj of SUBJECTS) {
      const existing = await db.collection("content")
        .where("subjectId", "==", subj.id)
        .where("type", "==", "notes")
        .limit(1)
        .get();

      if (!existing.empty) continue;

      const isSql = subj.id === "sql";
      const fileId = DRIVE_IDS[subj.id];
      const fileUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : "";

      const noteDoc = {
        title: isSql ? "MySQL Handbook" : `${subj.name} Chapter Wise Notes`,
        description: isSql 
          ? "Comprehensive MySQL database handbook covering queries, joins, indices, and administration."
          : `Comprehensive ${subj.name} notes covering all topics with examples and practice problems.`,
        type: "notes",
        subjectId: subj.id,
        subjectName: subj.name,
        semester: subj.semester,
        price: 19,
        thumbnailUrl: subj.thumbnailUrl,
        fileUrl: fileUrl,
        isLocked: true,
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection("content").add(noteDoc);
      created++;

      const pyqDoc = {
        title: `${subj.name} - Previous Year Questions`,
        description: `Previous year question papers for ${subj.name} with solutions and marking schemes.`,
        type: "pyq",
        subjectId: subj.id,
        subjectName: subj.name,
        semester: subj.semester,
        price: 29,
        thumbnailUrl: subj.thumbnailUrl,
        fileUrl: "",
        isLocked: true,
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection("content").add(pyqDoc);
      created++;
    }

    for (const pl of FREE_PLAYLISTS) {
      const existing = await db.collection("content")
        .where("subjectId", "==", pl.subjectId)
        .where("type", "==", "video")
        .limit(1)
        .get();

      if (!existing.empty) continue;

      await db.collection("content").add({
        ...pl,
        type: "video",
        price: 0,
        semester: null,
        fileUrl: "",
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return res.json({
      success: true,
      message: `Seeded ${created} content items (skipped existing)`,
      created,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return res.status(500).json({ error: error.message || "Seed failed" });
  }
}
