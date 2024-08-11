import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgvNCKbXOgNKbNME65fgWoS5nEwcCiJZw",
    authDomain: "user-login-d499e.firebaseapp.com",
    projectId: "user-login-d499e",
    storageBucket: "user-login-d499e.appspot.com",
    messagingSenderId: "616193531871",
    appId: "1:616193531871:web:b995923f46090fe2fa2e6a",
    measurementId: "G-WG7PNZGEKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});
const auth = getAuth(app);

export { app, analytics, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };