// firebase-config.js — Tokyo Table
// ─────────────────────────────────
// Initialises Firebase, exposes db / auth globals, and defines admin list.
// Loaded before app.js and admin.js so both can reference db / auth safely.

const firebaseConfig = {
  apiKey: "AIzaSyBVX3pGP02hJTO0zDanZPhIrEp6lq_cw0s",
  authDomain: "tokyo-table-df75d.firebaseapp.com",
  projectId: "tokyo-table-df75d",
  storageBucket: "tokyo-table-df75d.firebasestorage.app",
  messagingSenderId: "166498379593",
  appId: "1:166498379593:web:8e9ddbac59a82999129c98"
};

firebase.initializeApp(firebaseConfig);

// Global references used by both app.js and admin.js
const db   = firebase.firestore();
const auth = firebase.auth();

// ── Admin access list ──────────────────────────────────────────────────────
// Add or replace the second email here whenever you need to change admin #2.
const ADMIN_EMAILS = [
  'johanabraham345@gmail.com',
  'admin2@gmail.com'          // ← change this to the real second admin later
];

function isAdmin(email) {
  return email && ADMIN_EMAILS.includes(email.toLowerCase());
}

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
