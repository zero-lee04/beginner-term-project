// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBazFQ2zMXLcvtDcLLQJkKrRvOvBxBSbnY",
  authDomain: "beginner-project-zero.firebaseapp.com",
  projectId: "beginner-project-zero",
  storageBucket: "beginner-project-zero.firebasestorage.app",
  messagingSenderId: "220744950640",
  appId: "1:220744950640:web:280fe53d29194808f6a5b5",
  measurementId: "G-GNHCR6VK5M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);