// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
  authDomain: "mern-blog-e1064.firebaseapp.com",
  projectId: "mern-blog-e1064",
  storageBucket: "mern-blog-e1064.firebasestorage.app",
  messagingSenderId: "723581202841",
  appId: "1:723581202841:web:68d6f01d5cd727e057a308"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);