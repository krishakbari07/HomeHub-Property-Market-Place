// Test Multi-Tab Authentication Isolation
// Simulates two isolated browser tab contexts (Tab 1: Buyer, Tab 2: Agent)

console.log("==================================================");
console.log("🧪 Testing Multi-Tab Authentication Isolation");
console.log("==================================================");

// Simulated Storage Engine for a Tab (like browser sessionStorage)
class TabStorage {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Global Shared Storage (like browser localStorage)
const sharedLocalStorage = new TabStorage("localStorage");

// Multi-Tab Session Simulator implementing the exact HomeHub session logic
class TabSession {
  constructor(tabName) {
    this.tabName = tabName;
    this.sessionStorage = new TabStorage(`sessionStorage_${tabName}`);
  }

  login(token, user) {
    this.setSessionAuth(token, user, true);
  }

  setSessionAuth(token, user, isExplicitLogin = false) {
    if (token) this.sessionStorage.setItem("homehub_token", token);
    if (user) this.sessionStorage.setItem("homehub_current_user", JSON.stringify(user));

    if (isExplicitLogin) {
      if (token) sharedLocalStorage.setItem("homehub_token", token);
      if (user) sharedLocalStorage.setItem("homehub_current_user", JSON.stringify(user));
      return;
    }

    const localRaw = sharedLocalStorage.getItem("homehub_current_user");
    if (!localRaw) {
      if (token) sharedLocalStorage.setItem("homehub_token", token);
      if (user) sharedLocalStorage.setItem("homehub_current_user", JSON.stringify(user));
    } else if (user) {
      const localUser = JSON.parse(localRaw);
      if (localUser.id === user.id) {
        if (token) sharedLocalStorage.setItem("homehub_token", token);
        sharedLocalStorage.setItem("homehub_current_user", JSON.stringify(user));
      }
    }
  }

  revalidate(token, updatedUser) {
    this.setSessionAuth(token, updatedUser, false);
  }

  getToken() {
    return (
      this.sessionStorage.getItem("homehub_token") ||
      sharedLocalStorage.getItem("homehub_token")
    );
  }

  getUser() {
    const raw =
      this.sessionStorage.getItem("homehub_current_user") ||
      sharedLocalStorage.getItem("homehub_current_user");
    return raw ? JSON.parse(raw) : null;
  }

  refresh() {
    // Refresh rehydrates from this tab's sessionStorage
    const user = this.getUser();
    const token = this.getToken();
    return { token, user };
  }

  logout() {
    const currentUser = this.getUser();
    this.sessionStorage.removeItem("homehub_token");
    this.sessionStorage.removeItem("homehub_current_user");

    const localUserRaw = sharedLocalStorage.getItem("homehub_current_user");
    if (localUserRaw && currentUser) {
      const localUser = JSON.parse(localUserRaw);
      if (localUser.id === currentUser.id) {
        sharedLocalStorage.removeItem("homehub_token");
        sharedLocalStorage.removeItem("homehub_current_user");
      }
    }
  }

  handle401() {
    this.sessionStorage.removeItem("homehub_token");
    this.sessionStorage.removeItem("homehub_current_user");
  }
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// 1. Create two independent tabs
const tab1 = new TabSession("Tab1_Buyer");
const tab2 = new TabSession("Tab2_Agent");

const buyerUser = { id: "u_buyer_01", name: "Buyer User", role: "buyer", email: "buyer@homehub.com" };
const buyerToken = "jwt_buyer_token_111111";

const agentUser = { id: "u_agent_02", name: "Agent User", role: "agent", email: "agent@homehub.com" };
const agentToken = "jwt_agent_token_222222";

// Step 1: Tab 1 logs in as Buyer
tab1.login(buyerToken, buyerUser);
assert(tab1.getUser()?.role === "buyer", "Tab 1 initializes and is logged in as Buyer");
assert(tab1.getToken() === buyerToken, "Tab 1 attaches Buyer JWT token");

// Step 2: Tab 2 logs in as Agent
tab2.login(agentToken, agentUser);
assert(tab2.getUser()?.role === "agent", "Tab 2 logs in as Agent");
assert(tab2.getToken() === agentToken, "Tab 2 attaches Agent JWT token");

// Step 3: Tab 1 must remain Buyer! (Tab 2's login must not overwrite Tab 1)
assert(tab1.getUser()?.role === "buyer", "Tab 1 remains logged in as Buyer after Tab 2 login");
assert(tab1.getToken() === buyerToken, "Tab 1 token remains Buyer token");

// Step 3b: Tab 1 revalidates in background — must NOT overwrite Tab 2's Agent in shared storage
tab1.revalidate(buyerToken, { ...buyerUser, name: "Buyer User Updated" });
assert(tab1.getUser()?.role === "buyer", "Tab 1 remains Buyer after background revalidation");
const sharedUserAfterReval = JSON.parse(sharedLocalStorage.getItem("homehub_current_user"));
assert(sharedUserAfterReval.id === agentUser.id, "Tab 1 background revalidation preserves Tab 2 in shared storage");

// Step 4: Tab 1 simulates page refresh
const tab1Refreshed = tab1.refresh();
assert(tab1Refreshed.user?.role === "buyer", "Tab 1 retains Buyer identity after page refresh");
assert(tab1Refreshed.token === buyerToken, "Tab 1 retains Buyer token after page refresh");

// Step 5: Tab 2 simulates page refresh
const tab2Refreshed = tab2.refresh();
assert(tab2Refreshed.user?.role === "agent", "Tab 2 retains Agent identity after page refresh");
assert(tab2Refreshed.token === agentToken, "Tab 2 retains Agent token after page refresh");

// Step 6: Tab 2 logs out -> Tab 1 Buyer session MUST remain active!
tab2.logout();
assert(tab2.getUser() === null, "Tab 2 is logged out");
assert(tab1.getUser()?.role === "buyer", "Tab 1 session is untouched and STILL active as Buyer after Tab 2 logout");
assert(tab1.getToken() === buyerToken, "Tab 1 still has valid Buyer token");

// Step 7: Tab 1 receives a 401 Unauthorized
tab1.handle401();
assert(tab1.getUser() === null, "Tab 1 clears its own session on 401");

console.log("==================================================");
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
if (passedTests === totalTests) {
  console.log("🎉 Multi-tab authentication isolation verified successfully!");
} else {
  process.exit(1);
}
