import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { TweetData } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBtPvd1xsPf4h8u8EQxpiM-PHlZV2xAjGg",
  authDomain: "x-growth-4a545.firebaseapp.com",
  projectId: "x-growth-4a545",
  storageBucket: "x-growth-4a545.firebasestorage.app",
  messagingSenderId: "291351873448",
  appId: "1:291351873448:web:3eaca44d32fa510bbaff9d",
  measurementId: "G-DZETCZTGM9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Data Functions
export const saveTweetToDb = async (tweet: Omit<TweetData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "tweets"), tweet);
    return { ...tweet, id: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const fetchUserTweets = async (userId: string): Promise<TweetData[]> => {
  try {
    const q = query(
      collection(db, "tweets"), 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const tweets: TweetData[] = [];
    querySnapshot.forEach((doc) => {
      tweets.push({ id: doc.id, ...doc.data() } as TweetData);
    });
    return tweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    // Fallback if index is missing (often happens with combined queries in Firestore initially)
    // We can try fetching without orderBy and sort client side if index fails
    try {
        const q2 = query(collection(db, "tweets"), where("userId", "==", userId));
        const qs2 = await getDocs(q2);
        const t2: TweetData[] = [];
        qs2.forEach(doc => t2.push({ id: doc.id, ...doc.data() } as TweetData));
        return t2.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e2) {
        console.error("Retry failed", e2);
        return [];
    }
  }
};