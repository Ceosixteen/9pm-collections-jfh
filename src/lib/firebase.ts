import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import path from 'path';

// Loaded via fs instead of a JSON import: Node's ESM loader on Vercel requires
// an import attribute for JSON imports that neither tsx nor esbuild need locally.
const firebaseConfig = JSON.parse(
  readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8')
);

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const firebaseWebApiKey: string = firebaseConfig.apiKey;
export const firebaseStorageBucket: string = firebaseConfig.storageBucket;
export const firebaseFirestoreDatabaseId: string = firebaseConfig.firestoreDatabaseId || '(default)';
export { collection, doc, setDoc, getDocs, getDoc, deleteDoc, query, orderBy, limit, where };
