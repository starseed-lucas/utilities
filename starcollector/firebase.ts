// Import the Firebase functions you need
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Your web app's Firebase configuration (copy from the Firebase console)
const firebaseConfig = {
  apiKey: "YOUR-API-KEY-HERE", // Replace with your actual API key
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

// Google sign-in function
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
}

// Save user data function
async function saveUserData(userId, data) {
  try {
    await setDoc(doc(db, "users", userId), data);
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
}

// Load user data function
async function loadUserData(userId) {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
}

export { signInWithGoogle, saveUserData, loadUserData };