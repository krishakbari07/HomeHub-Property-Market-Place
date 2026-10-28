import React, { useState, useEffect } from "react";
import { Calendar, User, Phone, Mail, MapPin, XCircle, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { appointmentApi } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const Appointments = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmModalId, setConfirmModalId] = useState(null);
  const [cancelReason, setCancelReason] = useState("Advisor unavailable");

  const loadAgentAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await appointmentApi.getAgentAppointments();
      const list = Array.isArray(data) ? data : [];
      setAppointments(list);
    } catch (err) {
      console.error("Error loading agent appointments:", err);
      setError(err.message || "Failed to load assigned appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentAppointments();
    window.addEventListener("homehub_appointment_updated", loadAgentAppointments);
    const timer = setInterval(loadAgentAppointments, 5000);
    return () => {
      window.removeEventListener("homehub_appointment_updated", loadAgentAppointments);
      clearInterval(timer);
    };
  }, []);

  const handleConfirmAppointment = async (id) => {
    setConfirmingId(id);
    try {
      await appointmentApi.confirmAppointment(id);
      window.dispatchEvent(new Event("homehub_appointment_updated"));
      toast.success("Appointment confirmed successfully.");
      await loadAgentAppointments();
    } catch (err) {
      toast.error("Failed to confirm appointment: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmingId(null);
    }
  };

  const handleConfirmCancel = async (id) => {
    setCancellingId(id);
    try {
      await appointmentApi.cancelAppointment(id, cancelReason);
      window.dispatchEvent(new Event("homehub_appointment_updated"));
      setConfirmModalId(null);
      toast.success("Appointment cancelled successfully.");
      await loadAgentAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment: " + (err.response?.data?.message || err.message));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 border border-ivory-300 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-navy-900">Assigned Client Appointments</h1>
          <p className="text-navy-600 text-sm mt-1">
            Site visit bookings and private property viewings assigned to your portfolio.
          </p>
        </div>
        <div className="w-12 h-12 bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white rounded-2xl border border-ivory-300">
          <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
          <p className="text-sm font-semibold text-navy-600">Loading assigned appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ivory-300 space-y-3">
          <Calendar className="w-12 h-12 text-forest-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-navy-900">No appointments assigned yet</h3>
          <p className="text-navy-600 text-sm">Appointments requested by buyers selecting your listings will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const apptId = appt._id || appt.id;
            const isCancelled = appt.status?.toLowerCase() === "cancelled";
            const clientName = appt.user?.name || appt.userName || "Buyer Client";
            const clientEmail = appt.user?.email || appt.userEmail || "N/A";
            const clientPhone = appt.user?.phone || appt.userPhone || "+91 98765 00000";
            const propTitle = appt.property?.title || appt.propertyTitle || "Property Visit";
            const propLocation = appt.property?.location || appt.location || "Ahmedabad";

            return (
              <div
                key={apptId}
                className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-card space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                        isCancelled
                          ? "bg-rose-100 text-rose-800"
                          : appt.status?.toLowerCase() === "confirmed"
                          ? "bg-forest-50 text-forest-700 border border-forest-100"
                          : "bg-gold-50 text-gold-700 border border-gold-200"
                      }`}
                    >
                      {appt.status || "pending"}
                    </span>
                    <span className="text-xs text-navy-500 font-bold">
                      {appt.appointmentDate || appt.date} at {appt.appointmentTime || appt.time}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-navy-900">{propTitle}</h3>
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

                {/* Actions */}
                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between gap-2">
                  {isCancelled ? (
                    <span className="text-xs font-extrabold text-rose-600 flex items-center space-x-1">
                      <XCircle className="w-4 h-4" />
                      <span>Appointment Cancelled</span>
                    </span>
                  ) : appt.status?.toLowerCase() === "confirmed" ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-forest-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Appointment Confirmed</span>
                      </span>
                      <button
                        onClick={() => setConfirmModalId(apptId)}
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
                        className="flex-1 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-subtle"
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
                        onClick={() => setConfirmModalId(apptId)}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Confirmation Modal */}
                {confirmModalId === apptId && (
                  <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-elevated border border-ivory-300">
                      <h4 className="font-heading font-extrabold text-base text-navy-900">Confirm Cancellation</h4>
                      <p className="text-xs text-navy-600 leading-relaxed">
                        Are you sure you want to cancel this appointment for <span className="font-bold text-navy-900">{clientName}</span>?
                      </p>

                      <div>
                        <label className="text-[11px] font-bold text-navy-600 block mb-1">Reason for cancellation</label>
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full border border-ivory-300 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-forest-700"
                        />
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          onClick={() => handleConfirmCancel(apptId)}
                          disabled={cancellingId === apptId}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1"
                        >
                          {cancellingId === apptId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Cancellation"}
                        </button>
                        <button
                          onClick={() => setConfirmModalId(null)}
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
  );
};

export default Appointments;
