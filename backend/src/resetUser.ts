import "dotenv/config";
import { db } from "./config/firebase";

async function resetAllUsers() {
  console.log("Resetting all users and purchases...");
  try {
    // 1. Delete all purchases
    const purchasesSnap = await db.collection("purchases").get();
    if (!purchasesSnap.empty) {
      const batch = db.batch();
      purchasesSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Deleted ${purchasesSnap.size} purchase records.`);
    } else {
      console.log("No purchases found to delete.");
    }

    // 2. Reset user memberships
    const usersSnap = await db.collection("users").get();
    if (!usersSnap.empty) {
      const batch = db.batch();
      usersSnap.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isMember: false,
        });
      });
      await batch.commit();
      console.log(`Reset membership status for ${usersSnap.size} users.`);
    }

    console.log("✅ Reset complete! You can now test fresh purchases.");
  } catch (error) {
    console.error("Error resetting data:", error);
  }
  process.exit(0);
}

resetAllUsers();
