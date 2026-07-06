import admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  const isPlaceholder = !serviceAccount.privateKey || serviceAccount.privateKey.includes("YOUR_PRIVATE_KEY_HERE");
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId}.appspot.com`;
  
  if (isPlaceholder) {
    console.warn("\n⚠️  WARNING: FIREBASE_PRIVATE_KEY is not configured in backend/.env. Database writes from backend will fail!\n");
    admin.initializeApp({
      projectId: serviceAccount.projectId,
      storageBucket: bucketName,
    });
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: bucketName,
      });
    } catch (error: any) {
      console.error("\n❌  Error initializing Firebase Admin: Invalid private key in backend/.env!\n", error.message);
      admin.initializeApp({
        projectId: serviceAccount.projectId,
        storageBucket: bucketName,
      });
    }
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
export default admin;
