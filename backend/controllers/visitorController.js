import VisitorLog from "../models/VisitorLog.js";

// Log a new visitor page view
export const logVisit = async (req, res) => {
  try {
    const {
      visitorId,
      isLoggedIn,
      userName,
      userEmail,
      userRole,
      pageVisited,
      pageTitle,
      device,
      ipAddress
    } = req.body;

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || ipAddress || "127.0.0.1";
    const userAgentStr = req.headers["user-agent"] || device || "Web Browser";

    const log = await VisitorLog.create({
      visitorId: visitorId || `sess_${Math.random().toString(36).substring(2, 9)}`,
      isLoggedIn: Boolean(isLoggedIn),
      userName: userName || (isLoggedIn ? "Registered User" : "Guest Visitor (Not Logged In)"),
      userEmail: userEmail || (isLoggedIn ? "user@example.com" : "Anonymous Visitor"),
      userRole: userRole || (isLoggedIn ? "Buyer" : "Guest"),
      ipAddress: clientIp,
      pageVisited: pageVisited || "/",
      pageTitle: pageTitle || "HomeHub Real Estate",
      device: userAgentStr.includes("Mobile") ? "Mobile Device" : "Desktop Browser",
      userAgent: userAgentStr,
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Error logging visitor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seed initial realistic visitor logs if dataset is empty
const seedSampleVisitorLogs = async () => {
  const count = await VisitorLog.countDocuments();
  if (count === 0) {
    const sampleLogs = [
      {
        visitorId: "sess_guest_901",
        isLoggedIn: false,
        userName: "Guest Visitor (Not Logged In)",
        userEmail: "Anonymous Visitor",
        userRole: "Guest",
        ipAddress: "192.168.1.45",
        pageVisited: "/",
        pageTitle: "Home Page",
        device: "Desktop Browser (Chrome)",
        createdAt: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        visitorId: "sess_guest_902",
        isLoggedIn: false,
        userName: "Guest Visitor (Not Logged In)",
        userEmail: "Anonymous Visitor",
        userRole: "Guest",
        ipAddress: "157.33.102.18",
        pageVisited: "/properties",
        pageTitle: "Browse Marketplace Properties",
        device: "Mobile Browser (Safari)",
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        visitorId: "sess_user_101",
        isLoggedIn: true,
        userName: "Rahul Sharma",
        userEmail: "buyer@homehub.com",
        userRole: "buyer",
        ipAddress: "127.0.0.1",
        pageVisited: "/buyer/dashboard",
        pageTitle: "Buyer Dashboard Overview",
        device: "Desktop Browser (Edge)",
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        visitorId: "sess_guest_903",
        isLoggedIn: false,
        userName: "Guest Visitor (Not Logged In)",
        userEmail: "Anonymous Visitor",
        userRole: "Guest",
        ipAddress: "49.36.19.202",
        pageVisited: "/property/details",
        pageTitle: "Luxury 3 BHK Villa Details",
        device: "Mobile Browser (Chrome)",
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        visitorId: "sess_user_102",
        isLoggedIn: true,
        userName: "Priya Patel",
        userEmail: "agent@homehub.com",
        userRole: "agent",
        ipAddress: "127.0.0.1",
        pageVisited: "/agent/dashboard",
        pageTitle: "Agent CRM Portal",
        device: "Desktop Browser (Firefox)",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        visitorId: "sess_guest_904",
        isLoggedIn: false,
        userName: "Guest Visitor (Not Logged In)",
        userEmail: "Anonymous Visitor",
        userRole: "Guest",
        ipAddress: "103.21.124.50",
        pageVisited: "/login",
        pageTitle: "User Login Page",
        device: "Desktop Browser (Chrome)",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    await VisitorLog.insertMany(sampleLogs);
  }
};

// Get all visitor logs
export const getAllVisitorLogs = async (req, res) => {
  try {
    await seedSampleVisitorLogs();
    const logs = await VisitorLog.find().sort({ createdAt: -1 }).limit(200);

    const totalViews = logs.length;
    const loggedInCount = logs.filter((l) => l.isLoggedIn).length;
    const guestCount = logs.filter((l) => !l.isLoggedIn).length;
    const uniqueIps = new Set(logs.map((l) => l.ipAddress)).size;

    res.json({
      success: true,
      stats: {
        totalViews,
        loggedInCount,
        guestCount,
        uniqueIps,
      },
      logs,
    });
  } catch (error) {
    console.error("Error fetching visitor logs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear visitor logs
export const clearVisitorLogs = async (req, res) => {
  try {
    await VisitorLog.deleteMany({});
    res.json({ success: true, message: "Visitor logs cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
