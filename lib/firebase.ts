import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Determina si el entorno actual corresponde al staging canónico (staging.quhealthy.org)
 * o si está configurado para consumir los servicios de staging.
 */
export const isStagingEnvironment = (): boolean => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (
      host === 'staging.quhealthy.org' ||
      host.includes('staging') ||
      host.includes('stage')
    ) {
      return true;
    }
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiUrl.includes('staging') || apiUrl.includes('stage')) {
    return true;
  }
  return false;
};

// Evita inicializar Firebase con configuración productiva en staging.quhealthy.org
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (!isStagingEnvironment() && firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app, 'quhealthy-backend');
}

export { app, db };
