import { FIREBASE_CONFIG } from '@/config';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export const firebaseApp = initializeApp(FIREBASE_CONFIG);
export const firebaseDatabase = getDatabase(firebaseApp);