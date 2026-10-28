import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { appointmentApi } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const MyListings = () => {
  const navigate = useNavigate();
  const { myProperties, fetchMyProperties, deleteProperty } = useProperty();
  const { toast, confirm } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [cancelReason, setCancelReason] = useState("Advisor unavailable");
  const [activeTab, setActiveTab] = useState("listings"); // "listings" | "appointments"
  const [statusMessage, setStatusMessage] = useState("");

  const loadAgentAppointments = async () => {
    setLoadingAppts(true);
    try {
      const data = await appointmentApi.getAgentAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch agent appointments:", err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
    loadAgentAppointments();

    window.addEventListener("homehub_appointment_updated", loadAgentAppointments);
    const timer = setInterval(loadAgentAppointments, 5000);
    return () => {
      window.removeEventListener("homehub_appointment_updated", loadAgentAppointments);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "Delete Listing",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete Listing",
      cancelText: "Cancel",
      isDanger: true,
    });
    if (!confirmed) return;

    try {
      await deleteProperty(id);
      toast.success(`Listing "${title}" deleted successfully.`);
    } catch (err) {
      toast.error("Delete error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmAppointment = async (id) => {
    setConfirmingId(id);
    setStatusMessage("");
    try {
      await appointmentApi.confirmAppointment(id);
      window.dispatchEvent(new Event("homehub_appointment_updated"));
      setStatusMessage("Appointment confirmed successfully.");
      toast.success("Appointment confirmed successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      await loadAgentAppointments();
    } catch (err) {
      toast.error("Failed to confirm appointment: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelAppointment = async (id) => {
    setCancellingId(id);
    try {
      await appointmentApi.cancelAppointment(id, cancelReason);
      window.dispatchEvent(new Event("homehub_appointment_updated"));
      setCancelModalId(null);
      setStatusMessage("Appointment cancelled successfully.");
      toast.success("Appointment cancelled successfully.");
      setTimeout(() => setStatusMessage(""), 4000);
      await loadAgentAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment: " + (err.response?.data?.message || err.message));
    } finally {
      setCancellingId(null);
    }
  };

  const pendingAppts = appointments.filter(
    (a) => !a.status || a.status.toLowerCase() === "pending"
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-8 border border-ivory-300 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-navy-900">Managed Real Estate Portfolio</h1>
          <p className="text-navy-600 text-sm mt-1">
            Manage your published luxury properties and confirm client visit schedules.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/agent/add-listing"
            className="bg-forest-700 hover:bg-forest-800 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 text-sm shadow-subtle transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Listing</span>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-forest-50 border border-forest-200 text-forest-800 rounded-xl text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-ivory-300 space-x-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === "listings"
              ? "border-forest-700 text-forest-700"
              : "border-transparent text-navy-500 hover:text-navy-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listings ({myProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all relative ${
            activeTab === "appointments"
              ? "border-forest-700 text-forest-700"
              : "border-transparent text-navy-500 hover:text-navy-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Confirm Appointments</span>
          {pendingAppts.length > 0 && (
            <span className="px-2 py-0.5 bg-forest-700 text-white text-[10px] font-extrabold rounded-full">
              {pendingAppts.length} pending
            </span>
          )}
        </button>
      </div>

      {/* Listings Tab Content */}
      {activeTab === "listings" && (
        <>
          {myProperties.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-ivory-300 space-y-4">
              <Building2 className="w-12 h-12 text-navy-400 mx-auto" />
              <h3 className="text-lg font-heading font-bold text-navy-900">No agent listings found</h3>
              <p className="text-navy-600 text-sm">Add a listing to publish it on HomeHub marketplace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((prop) => {
                const propId = prop._id || prop.id;
                const propAppts = appointments.filter(
                  (a) =>
                    a.property?._id === propId ||
                    a.property?.id === propId ||
                    a.propertyId === propId
                );
                const pendingCount = propAppts.filter(
                  (a) => !a.status || a.status.toLowerCase() === "pending"
                ).length;

                return (
                  <div
                    key={propId}
                    className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-4 flex flex-col justify-between hover:shadow-elevated transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-heading font-bold text-lg text-navy-900">{prop.title}</h3>
                        <span className="px-2.5 py-1 bg-ivory-200 text-navy-800 text-[10px] font-extrabold rounded-full shrink-0 border border-ivory-300">
                          RERA Verified
                        </span>
                      </div>
                      <p className="text-lg font-black text-forest-700">{prop.formattedPrice}</p>
                      <p className="text-xs text-navy-600 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-navy-400" />
                        <span>{prop.location}</span>
                      </p>

                      {propAppts.length > 0 && (
                        <div className="pt-2">
                          <span
                            onClick={() => setActiveTab("appointments")}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-forest-50 text-forest-700 border border-forest-100 rounded-xl text-xs font-bold cursor-pointer hover:bg-forest-100 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-forest-700" />
                            <span>
                              {propAppts.length} Visit Booking{propAppts.length > 1 ? "s" : ""}{" "}
                              {pendingCount > 0 ? `(${pendingCount} Pending)` : ""}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-ivory-200 flex justify-between items-center text-xs gap-2">
                      <button
                        onClick={() => navigate(`/agent/edit-property/${propId}`)}
                        className="flex-1 py-2 bg-ivory-200 hover:bg-ivory-300 text-navy-900 font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(propId, prop.title)}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Appointments Tab Content & Confirm Buttons */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-extrabold text-navy-900">
              Assigned Site Visit Appointments
            </h2>
            <span className="text-xs text-navy-600 font-medium">
              Click <strong className="text-forest-700">Confirm Appointment</strong> to approve buyer site visits.
            </span>
          </div>

          {loadingAppts ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2 bg-white rounded-2xl border border-ivory-300">
              <Loader2 className="w-7 h-7 text-forest-700 animate-spin" />
              <p className="text-xs font-semibold text-navy-600">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-ivory-300 space-y-3">
              <Calendar className="w-12 h-12 text-forest-600 mx-auto" />
              <h3 className="text-lg font-heading font-bold text-navy-900">No appointments requested yet</h3>
              <p className="text-navy-600 text-sm">
                When buyers select your listings for property site visits, their booking requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt) => {
                const apptId = appt._id || appt.id;
                const statusStr = (appt.status || "pending").toLowerCase();
                const isConfirmed = statusStr === "confirmed";
                const isCancelled = statusStr === "cancelled";

                const clientName = appt.user?.name || appt.userName || "Buyer Client";
                const clientEmail = appt.user?.email || appt.userEmail || "N/A";
                const clientPhone = appt.user?.phone || appt.userPhone || "+91 98765 00000";
                const propTitle = appt.property?.title || appt.propertyTitle || "Property Site Visit";
                const propLocation = appt.property?.location || appt.location || "Ahmedabad";

                return (
                  <div
                    key={apptId}
                    className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-card space-y-4 flex flex-col justify-between hover:shadow-elevated transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                            isCancelled
                              ? "bg-rose-100 text-rose-800"
                              : isConfirmed
                              ? "bg-forest-50 text-forest-700 border border-forest-100"
                              : "bg-gold-50 text-gold-700 border border-gold-200"
                          }`}
                        >
                          {appt.status || "Pending"}
                        </span>
                        <span className="text-xs text-navy-600 font-bold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-navy-400" />
                          <span>
                            {appt.appointmentDate || appt.date} at {appt.appointmentTime || appt.time}
                          </span>
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-navy-900">{propTitle}</h3>
                      <p className="text-xs text-navy-600 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-navy-400" />
                        <span>{propLocation}</span>
                      </p>

                      <div className="bg-ivory-50 rounded-xl p-4 space-y-1.5 text-xs text-navy-800 border border-ivory-200">
                        <div className="flex items-center space-x-2 font-bold text-navy-900">
                          <User className="w-4 h-4 text-forest-700" />
                          <span>Client: {clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-navy-600">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{clientEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-navy-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{clientPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Confirm & Cancel */}
                    <div className="pt-3 border-t border-ivory-200 flex items-center justify-between gap-2">
                      {isCancelled ? (
                        <span className="text-xs font-extrabold text-rose-600 flex items-center space-x-1">
                          <XCircle className="w-4 h-4" />
                          <span>Appointment Cancelled</span>
                        </span>
                      ) : isConfirmed ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-extrabold text-forest-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-forest-700" />
                            <span>Appointment Confirmed</span>
                          </span>
                          <button
                            onClick={() => setCancelModalId(apptId)}
                            className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 w-full">
                          <button
                            onClick={() => handleConfirmAppointment(apptId)}
                            disabled={confirmingId === apptId}
                            className="flex-1 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-subtle transition-colors"
                          >
                            {confirmingId === apptId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm Appointment</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setCancelModalId(apptId)}
                            className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cancel Modal */}
                    {cancelModalId === apptId && (
                      <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-elevated border border-ivory-300">
                          <h4 className="font-heading font-extrabold text-base text-navy-900">
                            Confirm Cancellation
                          </h4>
                          <p className="text-xs text-navy-600 leading-relaxed">
                            Are you sure you want to cancel appointment for{" "}
                            <span className="font-bold text-navy-900">{clientName}</span>?
                          </p>

                          <div>
                            <label className="text-[11px] font-bold text-navy-600 block mb-1">
                              Reason for cancellation
                            </label>
                            <input
                              type="text"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full border border-ivory-300 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-forest-700"
                            />
                          </div>

                          <div className="flex items-center space-x-3 pt-2">
                            <button
                              onClick={() => handleCancelAppointment(apptId)}
                              disabled={cancellingId === apptId}
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1"
                            >
                              {cancellingId === apptId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Confirm Cancellation"
                              )}
                            </button>
                            <button
                              onClick={() => setCancelModalId(null)}
                              className="flex-1 bg-ivory-200 hover:bg-ivory-300 text-navy-800 font-bold py-2.5 rounded-xl text-xs"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Direct Quick Appointments Banner on Listings page */}
      {activeTab === "listings" && appointments.length > 0 && (
        <div className="bg-navy-900 text-white rounded-2xl p-6 border border-navy-800 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Assigned Site Visits</span>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              You have {pendingAppts.length} pending appointment{pendingAppts.length !== 1 ? "s" : ""} to confirm.
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("appointments")}
            className="bg-forest-700 hover:bg-forest-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-subtle transition-colors flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Review Appointments</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MyListings;
