import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import { formatClientBudget } from "../utils/currencyFormatter.js";
import { createNotification } from "../services/notificationService.js";

// Helper populate helper for appointments
const populateAppointmentQuery = (query) => {
  return query
    .populate("user", "name email phone avatar profileImage role preferredCity budgetRange buyerBudget rentalBudget")
    .populate("agent", "name email phone agencyName reraId region avatar profileImage role")
    .populate("property", "title price formattedPrice location city type purpose listingType image owner agent");
};

// Helper appointment response formatter
const formatAppointmentResponse = (appt) => {
  const doc = appt.toObject ? appt.toObject() : appt;
  const userObj = doc.user || {};
  return {
    ...doc,
    _id: doc._id,
    id: doc._id.toString(),
    propertyTitle: doc.property?.title || doc.propertyTitle || "Property Visit",
    location: doc.property?.location || doc.location || "Property Location",
    date: doc.appointmentDate || doc.date,
    time: doc.appointmentTime || doc.time,
    userName: userObj.name || doc.userName || "Buyer Client",
    userEmail: userObj.email || doc.userEmail || "",
    userPhone: userObj.phone || doc.userPhone || "+91 98765 00000",
    clientBudget: formatClientBudget(userObj),
    preferredCity: userObj.preferredCity || "Ahmedabad",
    agentName: doc.agent?.name || "Assigned Agent",
    status: doc.status || "pending",
  };
};

// @desc    Book a new property appointment (Buyer / Rental)
// @route   POST /api/appointments
// @access  Private (Buyer / Renter)
export const createAppointment = async (req, res) => {
  try {
    const { propertyId, property, agentId, agent, appointmentDate, date, appointmentTime, time, message } = req.body;

    const resolvedPropertyId = propertyId || property;
    if (!resolvedPropertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required to book an appointment." });
    }

    const targetProperty = await Property.findById(resolvedPropertyId);
    if (!targetProperty) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    // Resolve Agent: selected agent ID -> or property's assigned agent -> or property owner if agent -> or fallback agent
    let resolvedAgentId = agentId || agent;

    if (!resolvedAgentId || resolvedAgentId === "") {
      if (targetProperty.agent) {
        resolvedAgentId = targetProperty.agent;
      } else {
        const ownerUser = await User.findById(targetProperty.owner);
        if (ownerUser && ownerUser.role?.toLowerCase() === "agent") {
          resolvedAgentId = ownerUser._id;
        } else {
          const fallbackAgent = await User.findOne({ role: { $regex: new RegExp("^agent$", "i") } });
          if (fallbackAgent) {
            resolvedAgentId = fallbackAgent._id;
          } else {
            resolvedAgentId = targetProperty.owner;
          }
        }
      }
    }

    const newAppointment = await Appointment.create({
      user: req.user._id,
      property: targetProperty._id,
      agent: resolvedAgentId,
      appointmentDate: appointmentDate || date || new Date().toISOString().split("T")[0],
      appointmentTime: appointmentTime || time || "11:00 AM",
      message: message || "Property visit request",
      status: "pending",
    });

    const populatedAppt = await populateAppointmentQuery(Appointment.findById(newAppointment._id));
    const formatted = formatAppointmentResponse(populatedAppt);

    // Notify assigned advisor / owner AFTER DB booking succeeds
    try {
      if (resolvedAgentId && resolvedAgentId.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: resolvedAgentId,
          sender: req.user._id,
          type: "appointment_created",
          title: "New Site Visit Request",
          message: `${req.user.name || "Client"} requested a site visit for "${targetProperty.title}" on ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime}.`,
          property: targetProperty._id,
          propertyTitle: targetProperty.title,
          resourceType: "appointment",
          resourceId: newAppointment._id,
          link: "/agent/appointments",
          metadata: {
            date: newAppointment.appointmentDate,
            time: newAppointment.appointmentTime,
          },
        });
      }
    } catch (notifErr) {
      console.warn("Appointment creation notification advisory:", notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully in MongoDB Atlas",
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments for currently logged-in Buyer / Renter
// @route   GET /api/appointments/my OR /api/appointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await populateAppointmentQuery(
      Appointment.find({ user: req.user._id }).sort({ createdAt: -1 })
    );

    const formatted = appointments.map(formatAppointmentResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      appointments: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments assigned to currently logged-in Agent or Property Owner
// @route   GET /api/appointments/agent
// @access  Private (Agent / Seller)
export const getAgentAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find properties owned by or assigned to this user
    const userProperties = await Property.find({
      $or: [{ owner: userId }, { agent: userId }],
    }).select("_id");

    const userPropIds = userProperties.map((p) => p._id);

    // Find appointments where user is assigned agent OR owner of the property
    const appointments = await populateAppointmentQuery(
      Appointment.find({
        $or: [
          { agent: userId },
          { property: { $in: userPropIds } },
        ],
      }).sort({ createdAt: -1 })
    );

    const formatted = appointments.map(formatAppointmentResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      appointments: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await populateAppointmentQuery(Appointment.findById(req.params.id));
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const formatted = formatAppointmentResponse(appointment);
    return res.json({
      success: true,
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment (Agent or User)
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const isAssignedAgent = appointment.agent.toString() === req.user._id.toString();
    const isBookingUser = appointment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role && req.user.role.toLowerCase() === "admin";

    if (!isAssignedAgent && !isBookingUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment.",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user._id;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = req.body.cancellationReason || req.body.reason || "Cancelled by agent";

    const savedAppt = await appointment.save();
    const populatedAppt = await populateAppointmentQuery(Appointment.findById(savedAppt._id));
    const formatted = formatAppointmentResponse(populatedAppt);

    // Notify respective party AFTER DB cancellation succeeds
    try {
      const property = await Property.findById(appointment.property);
      const propTitle = property?.title || "Property Visit";
      const isAgentCancelling = isAssignedAgent || isAdmin;

      if (isAgentCancelling) {
        // Agent cancelled -> Notify Client
        await createNotification({
          recipient: appointment.user,
          sender: req.user._id,
          type: "appointment_cancelled",
          title: "Site Visit Cancelled",
          message: `Your site visit for "${propTitle}" scheduled for ${appointment.appointmentDate} was cancelled. Reason: ${appointment.cancellationReason}`,
          property: appointment.property,
          propertyTitle: propTitle,
          resourceType: "appointment",
          resourceId: appointment._id,
          link: "/buyer/visits",
          metadata: { reason: appointment.cancellationReason },
        });
      } else {
        // Client cancelled -> Notify Agent
        await createNotification({
          recipient: appointment.agent,
          sender: req.user._id,
          type: "appointment_cancelled",
          title: "Site Visit Cancelled by Client",
          message: `${req.user.name || "Client"} cancelled the site visit for "${propTitle}" scheduled on ${appointment.appointmentDate}. Reason: ${appointment.cancellationReason}`,
          property: appointment.property,
          propertyTitle: propTitle,
          resourceType: "appointment",
          resourceId: appointment._id,
          link: "/agent/appointments",
          metadata: { reason: appointment.cancellationReason },
        });
      }
    } catch (notifErr) {
      console.warn("Appointment cancellation notification advisory:", notifErr.message);
    }

    return res.json({
      success: true,
      message: "Appointment status updated to cancelled in MongoDB Atlas",
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Confirm / Complete)
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const { status, date, time } = req.body;
    if (status) appointment.status = status.toLowerCase();
    if (date) appointment.appointmentDate = date;
    if (time) appointment.appointmentTime = time;

    const savedAppt = await appointment.save();
    const populatedAppt = await populateAppointmentQuery(Appointment.findById(savedAppt._id));
    const formatted = formatAppointmentResponse(populatedAppt);

    // Notify client AFTER DB update succeeds
    try {
      const isConfirmed = status && status.toLowerCase() === "confirmed";
      const isRescheduled = Boolean(date || time);
      const property = await Property.findById(appointment.property);
      const propTitle = property?.title || "Property Visit";

      if (appointment.user && appointment.user.toString() !== req.user._id.toString()) {
        if (isConfirmed) {
          await createNotification({
            recipient: appointment.user,
            sender: req.user._id,
            type: "appointment_confirmed",
            title: "Site Visit Confirmed!",
            message: `Your site visit for "${propTitle}" has been confirmed for ${savedAppt.appointmentDate} at ${savedAppt.appointmentTime}.`,
            property: appointment.property,
            propertyTitle: propTitle,
            resourceType: "appointment",
            resourceId: appointment._id,
            link: "/buyer/visits",
            metadata: {
              date: savedAppt.appointmentDate,
              time: savedAppt.appointmentTime,
              status: "confirmed",
            },
          });
        } else if (isRescheduled) {
          await createNotification({
            recipient: appointment.user,
            sender: req.user._id,
            type: "appointment_rescheduled",
            title: "Site Visit Rescheduled",
            message: `Your site visit for "${propTitle}" was rescheduled to ${savedAppt.appointmentDate} at ${savedAppt.appointmentTime}.`,
            property: appointment.property,
            propertyTitle: propTitle,
            resourceType: "appointment",
            resourceId: appointment._id,
            link: "/buyer/visits",
            metadata: {
              date: savedAppt.appointmentDate,
              time: savedAppt.appointmentTime,
              status: savedAppt.status,
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("Appointment update notification advisory:", notifErr.message);
    }

    return res.json({
      success: true,
      message: "Appointment updated successfully",
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments/all
// @access  Private (Admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await populateAppointmentQuery(
      Appointment.find().sort({ createdAt: -1 })
    );

    const formatted = appointments.map(formatAppointmentResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      appointments: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment (Admin only)
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Appointment record deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

