// Verification of Real Backend Authentication Only (Zero Demo Bypasses)
const BASE_URL = "http://127.0.0.1:5000";

const runAuthVerification = async () => {
  console.log("==================================================");
  console.log("🔒 HomeHub Real Authentication Only Verification Suite");
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
    // 1. Designated Admin Login with Valid Credentials
    console.log("\n[Test 1] Testing Designated Admin Login (admin@homehub.com) ...");
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@homehub.com",
        password: "password123",
      }),
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, "Admin login succeeds with HTTP 200 OK");
    assert(adminData.role === "admin", "Admin receives 'admin' role from MongoDB Atlas");
    assert(typeof adminData.token === "string" && adminData.token.length > 20, "Admin receives genuine signed JWT");

    // 2. Genuine User Login (akbarikrish331@gmail.com)
    console.log("\n[Test 2] Testing Genuine User Profile Retrieval with JWT ...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, "Protected GET /api/auth/me verifies valid JWT token");
    assert(meData.data?.email === "admin@homehub.com" || meData.email === "admin@homehub.com", "Me endpoint confirms authenticated identity");

    // 3. Rejection of Invalid Password
    console.log("\n[Test 3] Testing Incorrect Password Rejection ...");
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@homehub.com",
        password: "wrong_password_attempt_999",
      }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert(wrongPassRes.status === 401, "Backend rejects incorrect password with HTTP 401");
    assert(wrongPassData.success === false, "Success flag is false for failed password");

    // 4. Rejection of Demo Accounts That Do Not Exist
    console.log("\n[Test 4] Testing Rejection of Non-Existent Demo Accounts ...");
    const demoEmails = [
      "buyer@homehub.com",
      "rental@homehub.com",
      "seller@homehub.com",
      "agent@homehub.com",
    ];

    for (const demoEmail of demoEmails) {
      const demoRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          password: "password123",
        }),
      });
      assert(demoRes.status === 401, `Backend rejects login for demo email '${demoEmail}' with HTTP 401`);
    }

    // 5. Missing Field Validation
    console.log("\n[Test 5] Testing Validation for Missing Credentials ...");
    const emptyRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });
    assert(emptyRes.status === 400, "Backend rejects empty login fields with HTTP 400 Bad Request");

    // 6. Protection Against Fake / Forged Token Bypasses
    console.log("\n[Test 6] Testing Token Forgery Protection on Protected Endpoints ...");
    const fakeTokenRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: "Bearer fake_forged_token_not_signed_by_secret" },
    });
    assert(fakeTokenRes.status === 401, "Protected API rejects fake / forged JWT with HTTP 401 Unauthorized");

    // 7. Verify Database User Registry (Only Genuine Users Exist)
    console.log("\n[Test 7] Verifying Live MongoDB Atlas User Records ...");
    const allUsersRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    const allUsersData = await allUsersRes.json();
    const usersList = Array.isArray(allUsersData) ? allUsersData : allUsersData.users || [];
    
    const userEmails = usersList.map((u) => u.email.toLowerCase());
    console.log("Current registered users in database:", userEmails);

    assert(userEmails.includes("admin@homehub.com"), "Designated admin 'admin@homehub.com' is present");
    assert(userEmails.includes("akbarikrish331@gmail.com"), "Genuine user 'akbarikrish331@gmail.com' is present");
    assert(!userEmails.includes("buyer@homehub.com"), "Demo user 'buyer@homehub.com' is absent from database");

    const adminCount = usersList.filter((u) => u.role?.toLowerCase() === "admin").length;
    assert(adminCount === 1, `Exactly 1 administrator exists in database (Found: ${adminCount})`);

    console.log("\n==================================================");
    console.log(`🏁 Authentication Verification Results: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Authentication verification error:", err);
    process.exit(1);
  }
};

runAuthVerification();
