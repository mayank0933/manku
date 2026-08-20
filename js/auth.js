/**
 * MAA ENTERPRISES — ADMIN AUTHENTICATION ENGINE (js/auth.js)
 * Implements Firebase Modular Auth with instant role resolution & session persistence
 */

import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  doc, 
  setDoc,
  serverTimestamp,
  isFirebaseConfigured
} from "./firebase-config.js";
import { showToast } from "./app.js";

let currentUser = null;
let currentIsAdmin = false;
const authListeners = [];

const LOCAL_ADMIN_SESSION_KEY = "maa_admin_session";

export async function loginAdminUser(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email address and password.");
  }

  const cleanEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      currentUser = user;
      currentIsAdmin = true;

      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify({
        uid: user.uid,
        email: user.email,
        isAdmin: true,
        timestamp: Date.now()
      }));

      if (db) {
        try {
          await setDoc(doc(db, "admins", user.uid), {
            uid: user.uid,
            email: user.email,
            role: "admin",
            active: true,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("[Auth] Firestore admin doc notice:", dbErr.message);
        }
      }

      updateHeaderAuthUI(user, true);
      return { success: true, user, isAdmin: true, message: "Welcome to Admin Workspace!" };
    } catch (error) {
      let friendlyMessage = "Authentication failed. Please verify your credentials.";
      if (error.code === "auth/invalid-email") friendlyMessage = "The email address format is invalid.";
      else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        friendlyMessage = "Incorrect email or password. Please check your credentials.";
      }
      throw new Error(friendlyMessage);
    }
  } else {
    if (cleanEmail === "admin@maaenterprises.com" && password.length >= 6) {
      const mockUser = {
        uid: "admin_local_uid_001",
        email: cleanEmail,
        displayName: "Center Admin (Rajesh Kumar)"
      };
      currentUser = mockUser;
      currentIsAdmin = true;
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify({
        uid: mockUser.uid,
        email: mockUser.email,
        isAdmin: true,
        timestamp: Date.now()
      }));
      updateHeaderAuthUI(mockUser, true);
      return { success: true, user: mockUser, isAdmin: true, message: "Offline admin session started." };
    } else {
      throw new Error("Invalid admin credentials.");
    }
  }
}

export async function logoutUser() {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (err) {}
  currentUser = null;
  currentIsAdmin = false;
  localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
  
  if (window.showToast) {
    showToast("Signed out successfully.", "info");
  }
  updateHeaderAuthUI(null, false);
  
  if (window.location.pathname.includes("admin.html")) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 400);
  }
}

export async function resetPassword(email) {
  if (!email || !email.trim()) throw new Error("Please enter your registered email address.");
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  }
  return true;
}

export function initAuthListener(callback) {
  if (typeof callback === "function") {
    authListeners.push(callback);
  }

  function broadcast(user, isAdmin) {
    currentUser = user;
    currentIsAdmin = isAdmin;
    updateHeaderAuthUI(currentUser, currentIsAdmin);
    authListeners.forEach(fn => {
      try { fn(currentUser, currentIsAdmin); } catch (e) { console.error(e); }
    });
  }

  if (auth && typeof onAuthStateChanged === "function") {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        broadcast(firebaseUser, true);
      } else {
        const localSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession);
            broadcast(parsed, true);
          } catch (e) {
            broadcast(null, false);
          }
        } else {
          broadcast(null, false);
        }
      }
    });
  } else {
    const localSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        broadcast(parsed, true);
      } catch (e) {
        broadcast(null, false);
      }
    } else {
      broadcast(null, false);
    }
  }
}

export function updateHeaderAuthUI(user, isAdmin) {
  const authButtons = document.querySelectorAll(".header-admin-btn, .mobile-admin-btn");
  authButtons.forEach(btn => {
    if (user && isAdmin) {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Admin Dashboard</span>
      `;
      btn.href = "admin.html";
    } else {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Admin Portal</span>
      `;
      btn.href = "login.html";
    }
  });
}

export function requireAdminAuth(onAuthorizedCallback) {
  const loadingOverlay = document.getElementById("adminAuthLoading");
  const unauthorizedScreen = document.getElementById("adminUnauthorized");
  const dashboardContent = document.getElementById("adminDashboardContent");

  function renderState(authorized, user) {
    if (loadingOverlay) loadingOverlay.style.display = "none";
    
    if (authorized) {
      if (unauthorizedScreen) unauthorizedScreen.style.display = "none";
      if (dashboardContent) dashboardContent.style.display = "block";
      if (typeof onAuthorizedCallback === "function") {
        onAuthorizedCallback(user);
      }
    } else {
      if (dashboardContent) dashboardContent.style.display = "none";
      if (unauthorizedScreen) unauthorizedScreen.style.display = "flex";
    }
  }

  initAuthListener((user, isAdmin) => {
    if (user && isAdmin) {
      renderState(true, user);
    } else {
      renderState(false, null);
    }
  });
}

if (typeof window !== 'undefined') {
  window.AuthService = {
    loginAdminUser,
    logoutUser,
    resetPassword,
    initAuthListener,
    updateHeaderAuthUI,
    requireAdminAuth
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
  });
}
