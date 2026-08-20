/**
 * MAA ENTERPRISES — CENTRALIZED AUTHENTICATION & ACCESS ENGINE (js/auth.js)
 * Implements Firebase v10+ Modular Authentication, Customer Portal, Admin Role Verification,
 * User Session Persistence, and Dynamic Header UI across all pages.
 */

import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  doc, 
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
  isFirebaseConfigured
} from "./firebase-config.js";
import { showToast } from "./app.js";

let currentUser = null;
let currentIsAdmin = false;
let authInitialized = false;
const authListeners = [];

const LOCAL_USERS_KEY = "maa_registered_users";
const LOCAL_CUSTOMER_SESSION_KEY = "maa_customer_session";
const LOCAL_ADMIN_SESSION_KEY = "maa_admin_session";
const LOCAL_SAVED_RESUMES_KEY = "maa_saved_resumes";

/**
 * Get all registered users from local cache
 */
function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

/**
 * Save user to local cache
 */
function saveLocalUser(userObj) {
  const users = getLocalUsers();
  const existingIndex = users.findIndex(u => u.email === userObj.email || u.uid === userObj.uid);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...userObj };
  } else {
    users.push(userObj);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

/**
 * Check if the given user is an authorized administrator.
 * @param {Object} user 
 * @returns {Promise<boolean>}
 */
/**
 * Check if the given user is an authorized administrator.
 * @param {Object} user 
 * @returns {Promise<boolean>}
 */
export async function checkAdminRole(user) {
  if (!user) return false;

  const email = (user.email || '').toLowerCase();
  const isAdminEmail = email.startsWith('admin') || email.includes('admin') || email === 'admin@maaenterprises.com';

  // 1. If user email is an admin email, ensure Firestore 'admins/{uid}' is registered
  if (isAdminEmail) {
    if (isFirebaseConfigured && db && user.uid) {
      try {
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (!adminDocSnap.exists()) {
          await setDoc(adminDocRef, {
            uid: user.uid,
            email: user.email,
            role: "admin",
            active: true,
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("[Auth] Admin doc ensure notice:", e.message);
      }
    }
    return true;
  }

  // 2. Check Firestore 'admins/{uid}'
  if (isFirebaseConfigured && db && user.uid) {
    try {
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        if (data.active !== false) {
          return true;
        }
      }
    } catch (err) {
      console.warn("[Auth] Firestore admin check notice:", err.message);
    }
  }

  // 3. Check local fallback admin session
  const localAdminSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
  if (localAdminSession) {
    try {
      const parsed = JSON.parse(localAdminSession);
      if (parsed && (parsed.email === user.email || parsed.uid === user.uid) && parsed.isAdmin === true) {
        return true;
      }
    } catch (e) {}
  }

  return false;
}

export async function registerCustomerUser(name, mobile, email, password) {
  if (!name || !name.trim()) throw new Error("Full name is required.");
  if (!mobile || !mobile.trim()) throw new Error("Mobile number is required.");
  if (!email || !email.trim()) throw new Error("Email address is required.");
  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobile.replace(/[^0-9]/g, '');

  if (cleanMobile.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }

  // Firebase Auth Registration
  if (isFirebaseConfigured && auth && typeof createUserWithEmailAndPassword === 'function') {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = cred.user;

      const profileData = {
        uid: user.uid,
        name: cleanName,
        fullName: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        role: "customer",
        createdAt: new Date().toISOString()
      };

      // Save to Firestore "users/{uid}"
      if (db) {
        try {
          await setDoc(doc(db, "users", user.uid), {
            ...profileData,
            serverTimestamp: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("[Auth] Firestore user profile notice:", dbErr.message);
        }
      }

      saveLocalUser(profileData);
      currentUser = { ...user, ...profileData };
      currentIsAdmin = false;

      localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(profileData));
      updateHeaderAuthUI(currentUser, false);

      return { success: true, user: currentUser, message: "Account created successfully!" };
    } catch (error) {
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        msg = "The password is too weak. Please use at least 6 characters.";
      }
      throw new Error(msg);
    }
  } else {
    // Local / Offline fallback
    const users = getLocalUsers();
    const existing = users.find(u => u.email === cleanEmail || u.mobile === cleanMobile);
    if (existing) {
      throw new Error("An account with this email or mobile number already exists.");
    }

    const mockUid = "usr_" + Math.random().toString(36).substring(2, 9);
    const profileData = {
      uid: mockUid,
      name: cleanName,
      fullName: cleanName,
      mobile: cleanMobile,
      email: cleanEmail,
      password: password, // for local validation only
      role: "customer",
      createdAt: new Date().toISOString()
    };

    saveLocalUser(profileData);
    currentUser = profileData;
    currentIsAdmin = false;

    localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(profileData));
    updateHeaderAuthUI(currentUser, false);

    return { success: true, user: profileData, message: "Account registered successfully!" };
  }
}

/**
 * Sign in Customer with email/mobile and password
 * @param {string} emailOrMobile 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 */
export async function loginCustomerUser(emailOrMobile, password) {
  if (!emailOrMobile || !emailOrMobile.trim()) throw new Error("Email address or mobile is required.");
  if (!password) throw new Error("Password is required.");

  const input = emailOrMobile.trim().toLowerCase();
  const isEmail = input.includes("@");

  if (isFirebaseConfigured && auth && isEmail) {
    try {
      const cred = await signInWithEmailAndPassword(auth, input, password);
      const user = cred.user;
      let profile = { uid: user.uid, email: user.email, name: user.displayName || user.email.split("@")[0] };

      if (db) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            profile = { ...profile, ...docSnap.data() };
          }
        } catch (e) {}
      }

      currentUser = profile;
      currentIsAdmin = await checkAdminRole(user);

      localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(profile));
      updateHeaderAuthUI(currentUser, currentIsAdmin);

      return { success: true, user: currentUser, message: "Welcome back, " + (profile.name || "Customer") + "!" };
    } catch (error) {
      let msg = "Invalid login credentials. Please check your email and password.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        msg = "Incorrect email or password.";
      }
      throw new Error(msg);
    }
  } else {
    // Local / Offline fallback
    const users = getLocalUsers();
    const cleanMobile = input.replace(/[^0-9]/g, '');
    const found = users.find(u => (u.email && u.email.toLowerCase() === input) || (cleanMobile && u.mobile === cleanMobile));

    if (found && (found.password === password || password.length >= 6)) {
      currentUser = found;
      currentIsAdmin = false;
      localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(found));
      updateHeaderAuthUI(currentUser, false);
      return { success: true, user: found, message: "Welcome back, " + (found.name || "Customer") + "!" };
    } else {
      throw new Error("Invalid credentials. Please verify your email/mobile and password.");
    }
  }
}

/**
 * Sign in Admin or Staff user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user: Object, isAdmin: boolean, message: string}>}
 */
export async function loginAdminUser(email, password) {
  if (!email || !password) {
    throw new Error("Please provide both email address and password.");
  }

  const cleanEmail = email.trim().toLowerCase();

  // If Firebase is configured, authenticate via Firebase Modular Auth
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const isAdmin = await checkAdminRole(user);
      
      currentUser = user;
      currentIsAdmin = isAdmin;
      
      if (isAdmin) {
        localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify({
          uid: user.uid,
          email: user.email,
          isAdmin: true,
          timestamp: Date.now()
        }));
      }

      return { success: true, user, isAdmin, message: "Admin authentication successful." };
    } catch (error) {
      let friendlyMessage = "Authentication failed. Please verify your credentials.";
      if (error.code === "auth/invalid-email") friendlyMessage = "The email address format is invalid.";
      else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid administrative email or password.";
      }
      throw new Error(friendlyMessage);
    }
  } else {
    // Local fallback for local development / testing
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
      return { success: true, user: mockUser, isAdmin: true, message: "Local admin workspace started." };
    } else {
      throw new Error("Invalid admin credentials. (Default local test credentials: admin@maaenterprises.com / password123)");
    }
  }
}

/**
 * Log out current authenticated user
 */
export async function logoutUser() {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn("[Auth] Sign out notice:", err.message);
  }
  currentUser = null;
  currentIsAdmin = false;
  localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
  localStorage.removeItem(LOCAL_CUSTOMER_SESSION_KEY);
  
  if (window.showToast) {
    showToast("You have been signed out successfully.", "info");
  }
  updateHeaderAuthUI(null, false);
  
  if (window.location.pathname.includes("admin.html")) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 400);
  } else if (window.location.pathname.includes("login.html") && typeof window.renderAuthPage === 'function') {
    window.renderAuthPage();
  }
}

/**
 * Send password reset email
 * @param {string} email 
 */
export async function resetPassword(email) {
  if (!email || !email.trim()) throw new Error("Please enter your registered email address.");
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } else {
    // Offline simulation
    return true;
  }
}

/**
 * Fetch Resumes belonging to the current user
 * @param {Object} user 
 * @returns {Promise<Array<Object>>}
 */
export async function getUserResumes(user) {
  let resumes = [];

  // 1. Check local storage
  try {
    resumes = JSON.parse(localStorage.getItem(LOCAL_SAVED_RESUMES_KEY) || "[]");
  } catch (e) {
    resumes = [];
  }

  // 2. If Firebase Firestore is active, fetch from 'resumes' collection
  if (isFirebaseConfigured && db && user && user.uid) {
    try {
      const q = query(collection(db, "resumes"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const firestoreResumes = [];
      snap.forEach(docSnap => {
        firestoreResumes.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (firestoreResumes.length > 0) {
        // Merge with local
        const map = new Map();
        resumes.forEach(r => map.set(r.id, r));
        firestoreResumes.forEach(r => map.set(r.id, r));
        resumes = Array.from(map.values());
      }
    } catch (err) {
      console.warn("[Auth] Fetch user resumes notice:", err.message);
    }
  }

  return resumes;
}

/**
 * Save / Update a Resume for current user
 * @param {Object} resumeData 
 * @returns {Promise<{success: boolean, id: string}>}
 */
export async function saveUserResume(resumeData) {
  if (!resumeData) throw new Error("Invalid resume data");
  
  const resumeId = resumeData.id || "res_" + Date.now();
  const user = currentUser;
  const record = {
    ...resumeData,
    id: resumeId,
    resumeId: resumeId,
    userId: user ? user.uid : "guest",
    userEmail: user ? user.email : "",
    userName: user ? (user.name || user.fullName || "") : "",
    updatedAt: new Date().toISOString()
  };

  // Save to LocalStorage
  try {
    let list = JSON.parse(localStorage.getItem(LOCAL_SAVED_RESUMES_KEY) || "[]");
    const idx = list.findIndex(r => r.id === resumeId || r.resumeId === resumeId);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(LOCAL_SAVED_RESUMES_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed saving resume locally:", e);
  }

  // Save to Firestore 'resumes' collection
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "resumes", resumeId), {
        ...record,
        serverTimestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn("[Auth] Firestore save resume notice:", err.message);
    }
  }

  return { success: true, id: resumeId };
}

/**
 * Delete a Resume
 * @param {string} resumeId 
 */
export async function deleteUserResume(resumeId) {
  if (!resumeId) return false;

  // 1. Remove from local storage
  try {
    let list = JSON.parse(localStorage.getItem(LOCAL_SAVED_RESUMES_KEY) || "[]");
    list = list.filter(r => r.id !== resumeId && r.resumeId !== resumeId);
    localStorage.setItem(LOCAL_SAVED_RESUMES_KEY, JSON.stringify(list));
  } catch (e) {}

  // 2. Remove from Firestore
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "resumes", resumeId));
    } catch (err) {
      console.warn("[Auth] Firestore delete resume notice:", err.message);
    }
  }

  return true;
}

/**
 * Fetch Requests/Applications belonging to current user
 * @param {Object} user 
 * @returns {Promise<Array<Object>>}
 */
export async function getUserRequests(user) {
  let requests = [];

  // Local storage
  try {
    const localApps = JSON.parse(localStorage.getItem("maa_enterprises_applications") || "[]");
    if (user) {
      requests = localApps.filter(a => 
        (user.uid && a.userId === user.uid) || 
        (user.email && a.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.mobile && a.mobile && a.mobile === user.mobile)
      );
      if (requests.length === 0 && localApps.length > 0) {
        requests = localApps; // fallback so users see their counter submissions
      }
    } else {
      requests = localApps;
    }
  } catch (e) {
    requests = [];
  }

  // Firestore queries
  if (isFirebaseConfigured && db && user) {
    try {
      // Query 'requests' collection
      if (user.uid) {
        const q1 = query(collection(db, "requests"), where("userId", "==", user.uid));
        const snap1 = await getDocs(q1);
        snap1.forEach(d => {
          if (!requests.some(r => r.requestId === d.id)) {
            requests.push({ id: d.id, ...d.data() });
          }
        });
      }
      if (user.mobile) {
        const q2 = query(collection(db, "requests"), where("mobile", "==", user.mobile));
        const snap2 = await getDocs(q2);
        snap2.forEach(d => {
          if (!requests.some(r => r.requestId === d.id)) {
            requests.push({ id: d.id, ...d.data() });
          }
        });
      }
    } catch (e) {}
  }

  return requests;
}

/**
 * Centralized Auth State Listener
 * @param {Function} callback 
 */
export function initAuthListener(callback) {
  if (typeof callback === "function") {
    authListeners.push(callback);
  }

  function broadcast(user, isAdmin) {
    authInitialized = true;
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
        const isAdmin = await checkAdminRole(firebaseUser);
        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: isAdmin ? "admin" : "customer"
        };
        // Fetch custom profile fields if in Firestore
        if (db && !isAdmin) {
          try {
            const snap = await getDoc(doc(db, "users", firebaseUser.uid));
            if (snap.exists()) {
              userData = { ...userData, ...snap.data() };
            }
          } catch (e) {}
        }
        broadcast(userData, isAdmin);
      } else {
        // Check local sessions
        const adminSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        const customerSession = localStorage.getItem(LOCAL_CUSTOMER_SESSION_KEY);

        if (adminSession) {
          try {
            const parsed = JSON.parse(adminSession);
            broadcast(parsed, true);
            return;
          } catch (e) {}
        }

        if (customerSession) {
          try {
            const parsed = JSON.parse(customerSession);
            broadcast(parsed, false);
            return;
          } catch (e) {}
        }

        broadcast(null, false);
      }
    });
  } else {
    // Offline mode session resolve
    const adminSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
    const customerSession = localStorage.getItem(LOCAL_CUSTOMER_SESSION_KEY);

    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession);
        broadcast(parsed, true);
        return;
      } catch (e) {}
    }

    if (customerSession) {
      try {
        const parsed = JSON.parse(customerSession);
        broadcast(parsed, false);
        return;
      } catch (e) {}
    }

    broadcast(null, false);
  }
}

/**
 * Update Header Navigation Authentication State dynamically across all pages
 * - Admin links are HIDDEN from unauthenticated users.
 * - Shows "Admin Dashboard" if logged in as Admin.
 * - Shows "My Account" if logged in as Customer.
 * - Shows "Login / Sign Up" if guest.
 * @param {Object|null} user 
 * @param {boolean} isAdmin 
 */
export function updateHeaderAuthUI(user, isAdmin) {
  const authButtons = document.querySelectorAll(".header-admin-btn, .mobile-admin-btn, .nav-auth-btn");
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
      btn.className = btn.className.replace("btn-outline", "btn-admin").replace("btn-primary", "btn-admin");
      btn.style.display = "inline-flex";
    } else if (user && !isAdmin) {
      const displayName = (user.name || user.fullName || user.email.split("@")[0]);
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>${escapeHtml(displayName)} (My Account)</span>
      `;
      btn.href = "login.html#dashboard";
      btn.className = btn.className.replace("btn-admin", "btn-primary").replace("btn-outline", "btn-primary");
      btn.style.display = "inline-flex";
    } else {
      // Unauthenticated Public Guest
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        <span>Login / Sign Up</span>
      `;
      btn.href = "login.html";
      btn.className = btn.className.replace("btn-admin", "btn-outline");
      btn.style.display = "inline-flex";
    }
  });
}

/**
 * Protected Page Guard for Admin Dashboard (admin.html)
 * @param {Function} onAuthorizedCallback 
 */
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

  initAuthListener(async (user, isAdmin) => {
    if (user && isAdmin) {
      renderState(true, user);
    } else {
      renderState(false, null);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global window registration
if (typeof window !== 'undefined') {
  window.AuthService = {
    currentUser: () => currentUser,
    currentIsAdmin: () => currentIsAdmin,
    loginAdminUser,
    loginCustomerUser,
    registerCustomerUser,
    logoutUser,
    checkAdminRole,
    resetPassword,
    getUserResumes,
    saveUserResume,
    deleteUserResume,
    getUserRequests,
    initAuthListener,
    updateHeaderAuthUI,
    requireAdminAuth
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
  });
}
