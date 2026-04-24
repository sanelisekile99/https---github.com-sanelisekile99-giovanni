console.log("Starting admin claim script...");

import admin from "firebase-admin";
import fs from 'fs';
import path from 'path';

console.log("Loading service account...");
// Load service account from JSON file
const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log("Initializing Firebase Admin...");
// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "PsCdg6bKImcxQaWMgMDf5dNPYhB3"; // Your Firebase user UID

console.log(`Setting admin claim for user: ${uid}`);
try {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Admin claim set successfully for user: ${uid}`);
} catch (error) {
  console.error("Error setting admin claim:", error);
}
