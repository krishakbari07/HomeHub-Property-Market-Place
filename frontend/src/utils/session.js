// Multi-tab safe session management for HomeHub
// Keeps each browser tab isolated (Buyer on Tab 1, Agent on Tab 2)
// Uses sessionStorage as the authoritative, tab-scoped source of truth

const TOKEN_KEY = "homehub_token";
const LEGACY_TOKEN_KEY = "token";
const USER_KEY = "homehub_current_user";

export const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  // Check tab-scoped sessionStorage first
  const tabToken = sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
  if (tabToken) return tabToken;

  // Fallback to localStorage if this tab has not been initialized yet
  const sharedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  if (sharedToken) {
    // Pin to this tab's sessionStorage so future changes in other tabs don't clobber this tab
    sessionStorage.setItem(TOKEN_KEY, sharedToken);
    return sharedToken;
  }
  return null;
};

export const getSessionUser = () => {
  if (typeof window === "undefined") return null;
  // Check tab-scoped sessionStorage first
  const tabUserRaw = sessionStorage.getItem(USER_KEY);
  if (tabUserRaw) {
    try {
      return JSON.parse(tabUserRaw);
    } catch (e) {
      // Invalid JSON, fall through
    }
  }

  // Fallback to localStorage if this tab is uninitialized
  const sharedUserRaw = localStorage.getItem(USER_KEY);
  if (sharedUserRaw) {
    try {
      const parsed = JSON.parse(sharedUserRaw);
      // Pin to this tab
      sessionStorage.setItem(USER_KEY, sharedUserRaw);
      return parsed;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const setSessionAuth = (token, user, isExplicitLogin = false) => {
  if (typeof window === "undefined") return;

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(LEGACY_TOKEN_KEY, token);
  }

  if (user) {
    const userString = JSON.stringify(user);
    sessionStorage.setItem(USER_KEY, userString);
  }

  // Explicit user login synchronously writes to shared storage so subsequent tabs start with it
  if (isExplicitLogin) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return;
  }

  // Background/revalidation updates only sync to localStorage if localStorage represents the same user or is empty
  try {
    const localUserRaw = localStorage.getItem(USER_KEY);
    if (!localUserRaw) {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(LEGACY_TOKEN_KEY, token);
      }
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } else if (user) {
      const localUser = JSON.parse(localUserRaw);
      const localId = localUser?.id || localUser?._id;
      const currentId = user?.id || user?._id;
      if (localId && currentId && localId === currentId) {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(LEGACY_TOKEN_KEY, token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    }
  } catch (e) {
    // ignore
  }
};

export const updateSessionUser = (updatedFields) => {
  const current = getSessionUser() || {};
  const merged = { ...current, ...updatedFields };
  const userString = JSON.stringify(merged);
  sessionStorage.setItem(USER_KEY, userString);

  // Sync to localStorage only if localStorage currently represents the same user
  try {
    const localRaw = localStorage.getItem(USER_KEY);
    if (localRaw) {
      const localParsed = JSON.parse(localRaw);
      if (localParsed?.id === current?.id || localParsed?._id === current?._id) {
        localStorage.setItem(USER_KEY, userString);
      }
    }
  } catch (e) {
    // ignore
  }
  return merged;
};

export const clearTabSession = () => {
  if (typeof window === "undefined") return;

  const currentTabUser = getSessionUser();

  // Clear this tab's storage
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  // Clear localStorage only if it holds the same user's token/session
  try {
    const localUserRaw = localStorage.getItem(USER_KEY);
    if (localUserRaw && currentTabUser) {
      const localUser = JSON.parse(localUserRaw);
      const localId = localUser?.id || localUser?._id;
      const currentId = currentTabUser?.id || currentTabUser?._id;
      if (localId && currentId && localId === currentId) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  } catch (e) {
    // ignore
  }
};

export const isTabAuthenticated = () => {
  return Boolean(getSessionToken() && getSessionUser());
};
