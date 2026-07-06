import "dotenv/config";
import admin, { auth, db } from "./config/firebase";

async function deleteMockUsers() {
  console.log("Fetching all users from Firebase Auth...");
  try {
    let nextPageToken;
    let mockUsersDeleted = 0;

    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      const mockUsers = listUsersResult.users.filter(user => 
        user.email && user.email.endsWith("@brainbank.com")
      );

      for (const user of mockUsers) {
        console.log(`Deleting mock user: ${user.email} (UID: ${user.uid})`);
        
        // Delete from Auth
        await auth.deleteUser(user.uid);
        
        // Delete from Firestore
        await db.collection("users").doc(user.uid).delete();
        
        mockUsersDeleted++;
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`✅ Successfully deleted ${mockUsersDeleted} mock users from Auth and Firestore.`);
  } catch (error) {
    console.error("Error deleting mock users:", error);
  }
  process.exit(0);
}

deleteMockUsers();
