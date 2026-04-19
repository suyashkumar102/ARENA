import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (keyString && !keyString.trim().startsWith('{')) {
      // Assume it's base64 if it doesn't start with {
      keyString = Buffer.from(keyString, 'base64').toString('utf-8');
    }

    const serviceAccount = keyString ? JSON.parse(keyString) : undefined;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: serviceAccount.project_id ? `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com` : undefined,
      });
    } else {
      console.warn('Firebase admin initialization failed: FIREBASE_SERVICE_ACCOUNT_KEY not set.');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.apps.length ? admin.database() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
