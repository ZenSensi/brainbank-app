import "dotenv/config";
import admin, { db } from "./config/firebase";

async function run() {
  console.log("Updating database prices...");
  const snapshot = await db.collection("content").get();
  console.log(`Found ${snapshot.size} documents.`);
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    let newPrice = 19;
    if (data.type === "pyq") {
      newPrice = 29;
    } else if (data.type === "video") {
      newPrice = 0;
    }
    batch.update(doc.ref, { price: newPrice });
    console.log(`Setting price of "${data.title}" to ₹${newPrice}`);
  });
  await batch.commit();
  console.log("Prices successfully updated in Firestore!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
