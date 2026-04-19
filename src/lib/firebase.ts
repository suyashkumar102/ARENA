import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { Auth, getAuth } from 'firebase/auth';
import { getMessaging, isSupported, getToken } from 'firebase/messaging';

// Parse config — may be empty/missing in demo mode
let firebaseConfig: Record<string, string> = {};
try {
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
  }
} catch {
  console.warn('[Firebase] Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG');
}

// True when a real project ID and database URL are present
export const isFirebaseConfigured =
  !!firebaseConfig.projectId && !!firebaseConfig.databaseURL;

// Initialize Firebase only when properly configured
let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} else {
  console.info('[Firebase] No valid config found — running in demo mode (no Firebase connection)');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messaging: any = null;
if (typeof window !== 'undefined' && app) {
  isSupported().then((supported) => {
    if (supported && app) {
      messaging = getMessaging(app);
    }
  });
}

/**
 * Subscribe the current device to a fan FCM topic.
 * In production: POST token to server, server calls adminMessaging.subscribeToTopic(token, topic)
 */
export async function subscribeToFanTopic(topic: string = 'arena-chinnaswamy-fans'): Promise<void> {
  if (!messaging) {
    console.warn('[FCM] Messaging not supported on this device/browser');
    return;
  }
  try {
    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });
    console.log(`[FCM] Device token obtained for topic "${topic}":`, token);
    // In production: POST token to server, server calls adminMessaging.subscribeToTopic(token, topic)
  } catch (error) {
    console.warn('[FCM] Failed to get device token:', error);
  }
}

export { app, db, auth, messaging };
