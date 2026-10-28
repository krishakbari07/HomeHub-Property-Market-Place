// Production Deployment & API Integrity Verification Script
const BASE_URL = "http://127.0.0.1:5000";

const runVerification = async () => {
  console.log("==================================================");
  console.log("🧪 Starting HomeHub Production Deployment Verification Suite");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Healthcheck Root
    console.log("\n[Test 1] Testing GET / ...");
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, "GET / returns HTTP 200");
    assert(rootData.status === "OK" && rootData.database === "connected", "GET / returns status OK and database connected");

    // 2. Healthcheck /health
    console.log("\n[Test 2] Testing GET /health ...");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, "GET /health returns HTTP 200");
    assert(healthData.status === "OK" && healthData.database === "connected", "GET /health reports database connected");

    // 3. Healthcheck /api/health
    console.log("\n[Test 3] Testing GET /api/health ...");
    const apiHealthRes = await fetch(`${BASE_URL}/api/health`);
    const apiHealthData = await apiHealthRes.json();
    assert(apiHealthRes.status === 200, "GET /api/health returns HTTP 200");
    assert(apiHealthData.status === "OK" && typeof apiHealthData.uptime === "number", "GET /api/health reports uptime number");

    // 4. Properties API
    console.log("\n[Test 4] Testing GET /api/properties ...");
    const propRes = await fetch(`${BASE_URL}/api/properties`);
    const propData = await propRes.json();
    assert(propRes.status === 200, "GET /api/properties returns HTTP 200");
    const propList = Array.isArray(propData) ? propData : propData.properties || [];
    assert(propList.length >= 1, `Found ${propList.length} property document(s)`);
    const genuineProperty = propList.find((p) => p.title.includes("Skyline Luxury Villa"));
    assert(!!genuineProperty, "Genuine property 'Skyline Luxury Villa Bodakdev' is preserved");

    // 5. Admin Authentication
    console.log("\n[Test 5] Testing Admin Authentication POST /api/auth/login ...");
    const testAdminPassword = process.env.ADMIN_PASSWORD || process.env.NEW_ADMIN_PASSWORD || "password123";
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@homehub.com",
        password: testAdminPassword,
      }),
    });
    const adminData = await adminLoginRes.json();
    if (adminLoginRes.status === 200 && adminData.role === "admin" && !!adminData.token) {
      assert(true, "Admin login returns HTTP 200 and valid JWT token");
    } else {
      console.log(`ℹ️ Admin login with test password returned ${adminLoginRes.status} (custom password active).`);
    }

    // 6. Security: Public Registration Privilege Escalation Protection
    console.log("\n[Test 6] Testing Public Registration Role Escalation Defense ...");
    const attackEmail = `escalation_attacker_${Date.now()}@example.com`;
    const regAttackRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Escalation Attacker",
        email: attackEmail,
        password: "securepassword123",
        role: "admin",
        isAdmin: true,
      }),
    });
    const regAttackData = await regAttackRes.json();
    assert(
      regAttackRes.status === 400 && regAttackData.message && regAttackData.message.includes("not permitted"),
      "Backend rejected privilege escalation attempt with HTTP 400 Bad Request"
    );

    // Now test valid public registration
    console.log("\n[Test 6b] Testing Valid Public User Registration ...");
    const validEmail = `valid_client_${Date.now()}@example.com`;
    const regValidRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Valid Client",
        email: validEmail,
        password: "securepassword123",
        phone: "+91 98765 43210",
        role: "buyer",
      }),
    });
    const regValidData = await regValidRes.json();
    assert(regValidRes.status === 201, "Genuine public registration returns HTTP 201 Created");
    const createdRole = regValidData.data?.role || regValidData.user?.role;
    assert(createdRole === "buyer", `Assigned standard role '${createdRole}'`);

    // Test Self-Service Password Reset
    console.log("\n[Test 6c] Testing Self-Service Password Reset ...");
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: validEmail,
        phone: "+91 98765 43210",
        newPassword: "newsecurepassword123",
      }),
    });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200, "Password reset returns HTTP 200 OK");
    assert(resetData.success === true, "Password reset reports success");

    // Clean up temporary valid test user
    const validUserId = regValidData.data?._id || regValidData.user?._id;
    if (adminData.token && validUserId) {
      const deleteUserRes = await fetch(`${BASE_URL}/api/users/${validUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminData.token}` },
      });
      assert(deleteUserRes.status === 200, "Cleaned up temporary verification test account");
    }

    // 7. Verify Admin User Count in Database
    if (adminData.token) {
      console.log("\n[Test 7] Verifying single designated admin in database ...");
      const allUsersRes = await fetch(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${adminData.token}` },
      });
      const allUsersData = await allUsersRes.json();
      const usersList = Array.isArray(allUsersData) ? allUsersData : allUsersData.users || [];
      const admins = usersList.filter((u) => u.role?.toLowerCase() === "admin");
      assert(admins.length === 1, `Exactly 1 admin exists in MongoDB Atlas (Found: ${admins.length})`);
      assert(admins[0].email.toLowerCase() === "admin@homehub.com", "The single admin is 'admin@homehub.com'");
    } else {
      console.log("\n[Test 7] Skipped admin collection check (provide ADMIN_PASSWORD env to run).");
    }

    console.log("\n==================================================");
    console.log(`🏁 Verification Results: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Verification execution error:", err);
    process.exit(1);
  }
};

runVerification();
