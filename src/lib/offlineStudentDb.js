/**
 * COE Offline Student Permanent Storage
 * Provides resilient, permanent local device persistence via localStorage & IndexedDB.
 * Ensures student session never expires and auto-restores on any device visit.
 */

const LOCAL_STORAGE_SESSION_KEY = "coe_student_offline_db";
const LOCAL_STORAGE_CACHE_KEY = "coe_dashboard_offline_cache";
const IDB_NAME = "COE_Offline_DB";
const IDB_STORE = "student_vault";
const IDB_VERSION = 1;

/**
 * Initialize or get IndexedDB database instance
 */
function openOfflineIndexedDb() {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: "key" });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save student profile permanently to both localStorage and IndexedDB
 */
export async function savePermanentStudentSession(userData) {
  if (typeof window === "undefined" || !userData) return;

  const sessionObj = {
    ...userData,
    rollNo: userData.rollNo || userData.username || "",
    username: userData.username || userData.rollNo || "",
    role: "STUDENT",
    savedAt: new Date().toISOString(),
    permanent: true,
  };

  // 1. Synchronous localStorage for instant hydration
  try {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessionObj));
    localStorage.setItem("coe_student_roll_permanent", sessionObj.rollNo);
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }

  // 2. Persistent IndexedDB for resilient offline storage
  try {
    const db = await openOfflineIndexedDb();
    if (db) {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      store.put({ key: "active_student", value: sessionObj });
    }
  } catch (err) {
    console.warn("Could not save to IndexedDB:", err);
  }
}

/**
 * Get permanent student session synchronously from localStorage (with IDB fallback)
 */
export function getPermanentStudentSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.rollNo || parsed.username)) {
        return parsed;
      }
    }
  } catch {
    // fallback or continue
  }

  return null;
}

/**
 * Async fetch from IndexedDB if localStorage was cleared
 */
export async function getPermanentStudentSessionFromIdb() {
  if (typeof window === "undefined" || !window.indexedDB) return null;

  try {
    const db = await openOfflineIndexedDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get("active_student");

      req.onsuccess = () => {
        if (req.result && req.result.value) {
          // Re-sync into localStorage if missing
          try {
            localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(req.result.value));
          } catch {}
          resolve(req.result.value);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Clear student session (strictly on intentional logout)
 */
export async function clearPermanentStudentSession() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    localStorage.removeItem("coe_student_roll_permanent");
  } catch {}

  try {
    const db = await openOfflineIndexedDb();
    if (db) {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete("active_student");
    }
  } catch {}
}

/**
 * Save complete student dashboard response to local offline DB
 */
export function savePermanentDashboardCache(dashboardData) {
  if (typeof window === "undefined" || !dashboardData) return;

  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify({
      data: dashboardData,
      cachedAt: new Date().toISOString(),
    }));
  } catch {}
}

/**
 * Get cached student dashboard for offline resilience
 */
export function getPermanentDashboardCache() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data || null;
  } catch {
    return null;
  }
}

