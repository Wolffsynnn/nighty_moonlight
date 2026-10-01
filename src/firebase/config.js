import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBAvLCqy-MAb9hH80h3GinwqQh53Wy1lSs',
  authDomain: 'howl-night---loup-garou.firebaseapp.com',
  projectId: 'howl-night---loup-garou',
  storageBucket: 'howl-night---loup-garou.firebasestorage.app',
  messagingSenderId: '999792178999',
  appId: '1:999792178999:web:1129ea54ae948801a14cb2',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;