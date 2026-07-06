import "dotenv/config";
import admin, { db } from "./config/firebase";
import * as fs from "fs";
import * as path from "path";

interface UploadItem {
  filename?: string; // Optional local filename
  url?: string; // Google Drive link or other hosted URL
  title: string;
  description: string;
  type: "notes" | "pyq" | "video";
  subjectId: string;
  subjectName: string;
  semester: number;
  price: number;
}

// Function to convert Google Drive share link to direct download link
function convertDriveLink(url: string): string {
  if (!url.includes("drive.google.com")) {
    return url;
  }
  
  let fileId = "";
  // Check for /file/d/FILE_ID/view
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  } else {
    // Check for id=FILE_ID
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }
  
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
}

async function runUploader() {
  const queueDir = path.join(__dirname, "../upload-queue");
  const metadataPath = path.join(queueDir, "metadata.json");

  console.log("🚀 Starting Brain Bank Auto-Uploader...");

  // Check if Firebase service credentials are set
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey || privateKey.includes("YOUR_PRIVATE_KEY_HERE")) {
    console.error("\n❌ ERROR: Your FIREBASE_PRIVATE_KEY is not configured in backend/.env!");
    console.error("Please add your real Firebase Private Key to run this upload script.\n");
    process.exit(1);
  }

  // Create queue directory and template if missing
  if (!fs.existsSync(metadataPath)) {
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }
    const template: UploadItem[] = [
      {
        url: "https://drive.google.com/file/d/YOUR_GOOGLE_DRIVE_FILE_ID/view?usp=sharing",
        title: "C Programming Handwritten Notes",
        description: "Comprehensive handwritten notes covering arrays, loops, and pointers in C.",
        type: "notes",
        subjectId: "c-programming",
        subjectName: "C Programming",
        semester: 1,
        price: 20
      }
    ];
    fs.writeFileSync(metadataPath, JSON.stringify(template, null, 2), "utf8");
    console.log(`\n📁 Created 'backend/upload-queue' folder and a template 'metadata.json'.`);
    console.log(`👉 Please place your Google Drive links in 'metadata.json', and run this command again!\n`);
    process.exit(0);
  }

  try {
    const rawData = fs.readFileSync(metadataPath, "utf8");
    const items: UploadItem[] = JSON.parse(rawData);

    if (items.length === 0) {
      console.log("No items found in metadata.json to upload.");
      process.exit(0);
    }

    for (const item of items) {
      let finalUrl = "";

      if (item.url) {
        finalUrl = convertDriveLink(item.url);
        console.log(`\n🔗 Processing URL for: '${item.title}'...`);
        if (finalUrl !== item.url) {
          console.log(`   Parsed Google Drive ID and converted to direct download link.`);
        }
      } else if (item.filename) {
        console.warn(`\n⚠️  Skipping local file '${item.filename}': Firebase Storage requires a paid/billing account.`);
        console.warn(`👉 Action required: Upload this file to Google Drive, share it as "Anyone with link can view", and use the "url" field instead!`);
        continue;
      } else {
        console.warn(`\n⚠️  Skipping '${item.title}': No "url" or "filename" provided.`);
        continue;
      }

      console.log(`🔥 Inserting document into Firestore database...`);
      const docRef = await db.collection("content").add({
        title: item.title,
        description: item.description,
        type: item.type,
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        semester: Number(item.semester),
        url: finalUrl,
        price: Number(item.price),
        downloadCount: 0,
        createdAt: Date.now()
      });

      console.log(`✅ Success! '${item.title}' is linked. Firestore ID: ${docRef.id}`);
    }

    console.log("\n🎉 All uploads completed successfully!\n");
  } catch (error: any) {
    console.error("\n❌ Upload failed with error:", error);
  }
  process.exit(0);
}

runUploader();
