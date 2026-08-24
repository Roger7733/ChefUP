import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD3bcxHjex8WtyPTHhBadmq1Ulwt32tNIs",
  authDomain: "chefup-cf336.firebaseapp.com",
  projectId: "chefup-cf336",
  storageBucket: "chefup-cf336.firebasestorage.app",
  messagingSenderId: "1018567042073",
  appId: "1:1018567042073:web:4e6e7a096a62663a7df688"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);