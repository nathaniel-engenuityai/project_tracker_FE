import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAwHn3RlQFPg9BXhQfLlX0vkz9Xmcgw3IE",
  authDomain: "project-35fb2289-4f58-4eae-8b8.firebaseapp.com",
  projectId: "project-35fb2289-4f58-4eae-8b8",
  storageBucket: "project-35fb2289-4f58-4eae-8b8.firebasestorage.app",
  messagingSenderId: "889275799849",
  appId: "1:889275799849:web:2eec6929e6be343cacff38"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);