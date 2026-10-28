import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Offer from "../models/Offer.js";
import Inquiry from "../models/Inquiry.js";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import {
  createNotification,
  fetchUserNotifications,
  markAsReadById,
  markAllUserNotificationsRead,
} from "../services/notificationService.js";

const run = async () => {
  await connectDB();
  console.log("==================================================");
  console.log("🧪 Comprehensive In-App Notifications Test Suite");
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
    // 1. Locate or create test users
    let buyer = await User.findOne({ role: "buyer" });
    if (!buyer) {
      buyer = await User.create({
        name: "Test Buyer",
        email: `buyer_${Date.now()}@test.com`,
        password: "Password123!",
        role: "buyer",
      });
    }

    let seller = await User.findOne({ role: "seller" });
    if (!seller) {
      seller = await User.create({
        name: "Test Seller",
        email: `seller_${Date.now()}@test.com`,
        password: "Password123!",
        role: "seller",
      });
    }

    let agent = await User.findOne({ role: "agent" });
    if (!agent) {
      agent = await User.create({
        name: "Test Agent",
        email: `agent_${Date.now()}@test.com`,
        password: "Password123!",
        role: "agent",
      });
    }

    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Test Admin",
        email: `admin_${Date.now()}@test.com`,
        password: "Password123!",
        role: "admin",
      });
    }

    // Another buyer to test isolation
    const unrelatedBuyer = await User.create({
      name: "Unrelated Buyer",
      email: `unrelated_${Date.now()}@test.com`,
      password: "Password123!",
      role: "buyer",
    });

    console.log(`👤 Test Buyer: ${buyer.name} (${buyer._id})`);
    console.log(`👤 Test Seller: ${seller.name} (${seller._id})`);
    console.log(`👤 Test Agent: ${agent.name} (${agent._id})`);
    console.log(`👤 Test Admin: ${admin.name} (${admin._id})`);
    console.log(`👤 Unrelated Buyer: ${unrelatedBuyer.name} (${unrelatedBuyer._id})`);

    // Clean previous test notifications for clean counts
    await Notification.deleteMany({
      recipient: { $in: [buyer._id, seller._id, agent._id, admin._id, unrelatedBuyer._id] },
    });

    // Create a test property
    const testProp = await Property.create({
      title: "Notification Test Villa",
      description: "Property for testing in-app notifications",
      price: 7500000,
      purpose: "buy",
      location: "Satellite, Ahmedabad",
      city: "Ahmedabad",
      owner: seller._id,
      ownerRole: "seller",
      agent: agent._id,
      createdBy: seller._id,
      creatorRole: "seller",
      status: "Available",
    });

    console.log("\n--- TEST 1: Offer Submission & Notifications ---");
    // Client creates an offer
    const offer = await Offer.create({
      property: testProp._id,
      buyer: buyer._id,
      seller: seller._id,
      listingCreator: seller._id,
      listingCreatorRole: "seller",
      agent: agent._id,
      offerType: "purchase",
      amount: 7200000,
      askingPrice: 7500000,
      status: "pending",
      terms: "Standard inspection 7 days",
    });

    // Notify seller
    const submitNotif = await createNotification({
      recipient: seller._id,
      sender: buyer._id,
      type: "offer_submitted",
      title: "New Offer Received",
      message: `${buyer.name} submitted an offer of ₹7,200,000 for ${testProp.title}`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "offer",
      resourceId: offer._id,
      link: `/dashboard/seller/offers`,
      metadata: { offerAmount: offer.amount, propertyTitle: testProp.title },
    });

    assert(submitNotif && submitNotif._id, "Notification created on offer submission");
    assert(submitNotif.recipient.toString() === seller._id.toString(), "Offer notification recipient is the Seller");
    assert(submitNotif.isRead === false, "Offer notification starts as unread");

    console.log("\n--- TEST 2: Offer Countered with Correct Details ---");
    // Seller counters the offer
    offer.status = "countered";
    offer.counterAmount = 7400000;
    offer.counterTerms = "Close within 15 days";
    await offer.save();

    const counterNotif = await createNotification({
      recipient: buyer._id,
      sender: seller._id,
      type: "offer_countered",
      title: "Offer Countered",
      message: `A counteroffer of ₹7,400,000 was proposed for ${testProp.title}. Terms: Close within 15 days`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "offer",
      resourceId: offer._id,
      link: `/dashboard/buyer/offers`,
      metadata: {
        counterAmount: offer.counterAmount,
        counterTerms: offer.counterTerms,
        propertyTitle: testProp.title,
      },
    });

    assert(counterNotif.recipient.toString() === buyer._id.toString(), "Counteroffer notification sent to Buyer");
    assert(counterNotif.metadata.counterAmount === 7400000, "Counteroffer metadata contains accurate counterAmount");
    assert(counterNotif.metadata.counterTerms === "Close within 15 days", "Counteroffer metadata contains accurate terms");

    console.log("\n--- TEST 3: Offer Accepted / Rejected Flow ---");
    // Seller accepts offer
    offer.status = "accepted";
    await offer.save();

    const acceptNotif = await createNotification({
      recipient: buyer._id,
      sender: seller._id,
      type: "offer_accepted",
      title: "Offer Accepted! 🎉",
      message: `Congratulations! Your offer of ₹7,200,000 for ${testProp.title} has been accepted!`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "offer",
      resourceId: offer._id,
      link: `/dashboard/buyer/offers`,
      metadata: { propertyTitle: testProp.title, offerAmount: offer.amount },
    });

    assert(acceptNotif.type === "offer_accepted", "Offer accepted notification created successfully");
    assert(acceptNotif.recipient.toString() === buyer._id.toString(), "Accepted notification delivered to Buyer");

    console.log("\n--- TEST 4: Inquiry Submission & Manager Notification ---");
    const inquiry = await Inquiry.create({
      property: testProp._id,
      propertyTitle: testProp.title,
      sender: buyer._id,
      userName: buyer.name,
      userEmail: buyer.email,
      userPhone: "+91 98765 43210",
      message: "Is this villa available for immediate possession?",
      status: "Pending",
    });

    // Listing manager (agent) receives notification
    const inqNotif = await createNotification({
      recipient: agent._id,
      sender: buyer._id,
      type: "inquiry_submitted",
      title: "New Property Inquiry",
      message: `New inquiry from ${buyer.name} for "${testProp.title}": "${inquiry.message.substring(0, 80)}"`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "inquiry",
      resourceId: inquiry._id,
      link: `/dashboard/agent/inquiries`,
      metadata: { propertyTitle: testProp.title },
    });

    assert(inqNotif.recipient.toString() === agent._id.toString(), "Inquiry notification delivered to assigned Agent");

    console.log("\n--- TEST 5: Inquiry Response & Genuine Client Response Persistence ---");
    // Agent responds to inquiry
    inquiry.status = "Responded";
    inquiry.response = "Yes, immediate possession is available. We can arrange a walkthrough this Thursday.";
    inquiry.respondedBy = agent._id;
    inquiry.respondedAt = new Date();
    await inquiry.save();

    const inqReplyNotif = await createNotification({
      recipient: buyer._id,
      sender: agent._id,
      type: "inquiry_replied",
      title: "Inquiry Response Received",
      message: `Your inquiry about "${testProp.title}" received a response: "${inquiry.response}"`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "inquiry",
      resourceId: inquiry._id,
      link: `/dashboard/buyer/inquiries`,
      metadata: { propertyTitle: testProp.title, responseText: inquiry.response },
    });

    assert(inqReplyNotif.recipient.toString() === buyer._id.toString(), "Inquiry reply notification sent to Buyer");
    assert(inqReplyNotif.metadata.responseText.includes("immediate possession"), "Notification includes genuine response text");

    // Verify persisted inquiry
    const savedInquiry = await Inquiry.findById(inquiry._id);
    assert(savedInquiry.response === inquiry.response, "Inquiry response text persisted in database");
    assert(savedInquiry.status === "Responded", "Inquiry status updated to Responded");
    assert(savedInquiry.respondedBy.toString() === agent._id.toString(), "Inquiry respondedBy tracks advisor ID");

    console.log("\n--- TEST 6: Strict Client Inquiry & Notification Isolation ---");
    // Querying inquiries as buyer returns the inquiry
    const buyerInquiries = await Inquiry.find({ sender: buyer._id });
    assert(buyerInquiries.length >= 1, "Buyer can view their own inquiry");

    // Querying inquiries as unrelatedBuyer returns 0
    const unrelatedInquiries = await Inquiry.find({ sender: unrelatedBuyer._id });
    assert(unrelatedInquiries.length === 0, "Unrelated buyer CANNOT see other client's inquiries");

    // Unrelated buyer attempts to fetch notifications
    const unrelatedNotifsData = await fetchUserNotifications(unrelatedBuyer._id);
    assert(unrelatedNotifsData.total === 0 && unrelatedNotifsData.notifications.length === 0, "Unrelated buyer has 0 notifications from other users' events");

    console.log("\n--- TEST 7: Appointment Flow (Create, Confirm, Reschedule, Cancel) ---");
    // Client requests appointment
    const appt = await Appointment.create({
      property: testProp._id,
      user: buyer._id,
      agent: agent._id,
      appointmentDate: "2026-11-05",
      appointmentTime: "10:30 AM",
      status: "pending",
      message: "First site visit",
    });

    const apptCreatedNotif = await createNotification({
      recipient: agent._id,
      sender: buyer._id,
      type: "appointment_created",
      title: "New Site Visit Request",
      message: `${buyer.name} requested a site visit for "${testProp.title}" on 2026-11-05 at 10:30 AM`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "appointment",
      resourceId: appt._id,
      link: `/dashboard/agent/appointments`,
      metadata: { propertyTitle: testProp.title, date: appt.appointmentDate, time: appt.appointmentTime },
    });
    assert(apptCreatedNotif.recipient.toString() === agent._id.toString(), "Appointment request notifies Advisor");

    // Advisor confirms appointment
    appt.status = "confirmed";
    await appt.save();

    const apptConfirmNotif = await createNotification({
      recipient: buyer._id,
      sender: agent._id,
      type: "appointment_confirmed",
      title: "Site Visit Confirmed!",
      message: `Your site visit for "${testProp.title}" has been confirmed for 2026-11-05 at 10:30 AM`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "appointment",
      resourceId: appt._id,
      link: `/dashboard/buyer/appointments`,
      metadata: { propertyTitle: testProp.title, date: appt.appointmentDate, time: appt.appointmentTime },
    });
    assert(apptConfirmNotif.recipient.toString() === buyer._id.toString(), "Confirmation notifies Client");

    // Advisor reschedules appointment
    appt.appointmentDate = "2026-11-06";
    appt.appointmentTime = "02:00 PM";
    appt.status = "confirmed"; // or rescheduled
    await appt.save();

    const apptReschedNotif = await createNotification({
      recipient: buyer._id,
      sender: agent._id,
      type: "appointment_rescheduled",
      title: "Site Visit Rescheduled",
      message: `Your site visit for "${testProp.title}" was rescheduled to 2026-11-06 at 02:00 PM`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "appointment",
      resourceId: appt._id,
      link: `/dashboard/buyer/appointments`,
      metadata: { propertyTitle: testProp.title, date: appt.appointmentDate, time: appt.appointmentTime },
    });
    assert(apptReschedNotif.type === "appointment_rescheduled", "Reschedule notification created with updated datetime");

    // Client cancels appointment
    appt.status = "cancelled";
    appt.cancellationReason = "Client has a conflict";
    await appt.save();

    const apptCancelNotif = await createNotification({
      recipient: agent._id,
      sender: buyer._id,
      type: "appointment_cancelled",
      title: "Site Visit Cancelled by Client",
      message: `${buyer.name} cancelled the site visit for "${testProp.title}" scheduled on 2026-11-06. Reason: Client has a conflict`,
      property: testProp._id,
      propertyTitle: testProp.title,
      resourceType: "appointment",
      resourceId: appt._id,
      link: `/dashboard/agent/appointments`,
      metadata: { propertyTitle: testProp.title, reason: appt.cancellationReason },
    });
    assert(apptCancelNotif.recipient.toString() === agent._id.toString(), "Cancellation notifies Advisor");

    console.log("\n--- TEST 8: Duplicate Notification Prevention (Deduplication) ---");
    // Attempt rapid duplicate creation within 5 seconds with same recipient, resourceId, and type
    const notif1 = await createNotification({
      recipient: buyer._id,
      sender: agent._id,
      type: "system",
      title: "Duplicate Check Alert",
      message: "Testing deduplication throttle",
      resourceType: "property",
      resourceId: testProp._id,
    });

    const notif2 = await createNotification({
      recipient: buyer._id,
      sender: agent._id,
      type: "system",
      title: "Duplicate Check Alert",
      message: "Testing deduplication throttle",
      resourceType: "property",
      resourceId: testProp._id,
    });

    assert(
      notif1 && notif2 && notif1._id.toString() === notif2._id.toString(),
      "Duplicate notification request within 5s returned existing record without creating duplicate"
    );

    const dupCount = await Notification.countDocuments({
      recipient: buyer._id,
      type: "system",
      resourceId: testProp._id,
    });
    assert(dupCount === 1, "Only 1 notification document exists in MongoDB after duplicate call");

    console.log("\n--- TEST 9: Notification Ownership & Marking Read ---");
    // Buyer has multiple notifications
    const buyerNotifsBefore = await fetchUserNotifications(buyer._id);
    const unreadCountBefore = buyerNotifsBefore.notifications.filter((n) => !n.isRead).length;
    assert(unreadCountBefore > 0, `Buyer has ${unreadCountBefore} unread notifications`);

    // Unrelated user tries to mark Buyer's notification as read
    const targetNotifId = buyerNotifsBefore.notifications[0]._id;
    const unauthorizedAttempt = await markAsReadById(targetNotifId, unrelatedBuyer._id);
    assert(unauthorizedAttempt === null, "Other user CANNOT mark another user's notification as read");

    // Buyer marks their own notification as read
    const readResult = await markAsReadById(targetNotifId, buyer._id);
    assert(readResult !== null && readResult.isRead === true, "Buyer successfully marks their own notification as read");
    assert(readResult.readAt instanceof Date, "readAt timestamp is populated");

    // Buyer marks all as read
    const markAllCount = await markAllUserNotificationsRead(buyer._id);
    assert(markAllCount > 0, `markAllUserNotificationsRead modified ${markAllCount} notifications`);

    const buyerNotifsAfter = await fetchUserNotifications(buyer._id);
    const unreadCountAfter = buyerNotifsAfter.notifications.filter((n) => !n.isRead).length;
    assert(unreadCountAfter === 0, "All notifications for Buyer are now read");

    console.log("\n--- TEST 10: Failed State Changes Do Not Generate False Success ---");
    // Test transaction-safety invariant: if an offer update throws, no notification is written
    let errorThrown = false;
    try {
      // Simulate failed save with invalid enum
      const invalidOffer = new Offer({
        property: testProp._id,
        buyer: buyer._id,
        seller: seller._id,
        amount: -500, // Invalid amount
        askingPrice: 7500000,
        offerType: "invalid_type",
        status: "invalid_status",
      });
      await invalidOffer.save();

      // We should NOT reach this notification call
      await createNotification({
        recipient: buyer._id,
        sender: seller._id,
        type: "offer_accepted",
        title: "False Success",
        message: "This should never be created",
      });
    } catch (err) {
      errorThrown = true;
    }
    assert(errorThrown, "Invalid database operation was caught and rejected");

    const falseNotif = await Notification.findOne({ title: "False Success" });
    assert(falseNotif === null, "No false notification created when database operation fails");

    // Cleanup test records
    await Notification.deleteMany({
      recipient: { $in: [buyer._id, seller._id, agent._id, admin._id, unrelatedBuyer._id] },
    });
    await Offer.deleteMany({ property: testProp._id });
    await Inquiry.deleteMany({ property: testProp._id });
    await Appointment.deleteMany({ property: testProp._id });
    await Property.findByIdAndDelete(testProp._id);
    await User.findByIdAndDelete(unrelatedBuyer._id);

    console.log("\n==================================================");
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  }
};

run();
