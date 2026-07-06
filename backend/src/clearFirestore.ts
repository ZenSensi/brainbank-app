import "dotenv/config";
import { db } from "./config/firebase";

async function clearContentCollection() {
  console.log("Clearing content collection...");
  try {
    const snapshot = await db.collection("content").get();
    if (snapshot.empty) {
      console.log("Collection is already empty!");
      process.exit(0);
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${snapshot.size} documents from 'content' collection!`);
  } catch (error) {
    console.error("Error clearing collection:", error);
  }
  process.exit(0);
}

clearContentCollection();
