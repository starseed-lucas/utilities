// firebase-service.ts - Firebase integration service

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { AppData } from './models';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR-API-KEY-HERE", // Replace with your actual API key
  authDomain: "star-collector.firebaseapp.com",
  projectId: "star-collector",
  storageBucket: "star-collector.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export class FirebaseService {
  private user: User | null = null;

  constructor() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  /**
   * Sign in with Google
   * @returns Promise with the signed-in user or null if sign-in failed
   */
  async signInWithGoogle(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      this.user = result.user;
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return null;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
      this.user = null;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /**
   * Check if a user is currently signed in
   * @returns boolean indicating if user is signed in
   */
  isUserSignedIn(): boolean {
    return this.user !== null;
  }

  /**
   * Get the current user's ID
   * @returns User ID string or null if not signed in
   */
  getUserId(): string | null {
    return this.user ? this.user.uid : null;
  }

  /**
   * Save app data to Firestore
   * @param data AppData to save
   * @returns Promise indicating success
   */
  async saveData(data: AppData): Promise<boolean> {
    if (!this.user) {
      console.error("Cannot save data: User not signed in");
      return false;
    }

    try {
      // Add timestamp
      const dataWithTimestamp = {
        ...data,
        lastSync: new Date().toISOString()
      };

      await setDoc(doc(db, "users", this.user.uid), dataWithTimestamp);
      return true;
    } catch (error) {
      console.error("Error saving data:", error);
      return false;
    }
  }

  /**
   * Load app data from Firestore
   * @returns Promise with the loaded AppData or null if not found
   */
  async loadData(): Promise<AppData | null> {
    if (!this.user) {
      console.error("Cannot load data: User not signed in");
      return null;
    }

    try {
      const docSnap = await getDoc(doc(db, "users", this.user.uid));
      if (docSnap.exists()) {
        return docSnap.data() as AppData;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const firebaseService = new FirebaseService();