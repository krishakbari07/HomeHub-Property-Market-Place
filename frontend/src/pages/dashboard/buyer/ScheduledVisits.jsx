import React, { useEffect } from "react";
import { Calendar, MapPin, User, XCircle, Clock } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";

const ScheduledVisits = () => {
  const { appointments, fetchMyAppointments } = useProperty();

  useEffect(() => {
    fetchMyAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Scheduled Property Visits
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Confirmed site visits escorted by certified HomeHub advisors.
          </p>
        </div>
        <div className="w-12 h-12 bg-ivory-100 text-forest-700 border border-ivory-300 rounded-2xl flex items-center justify-center font-bold shadow-subtle">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 space-y-3">
          <Calendar className="w-10 h-10 text-navy-400 mx-auto" />
          <h3 className="text-base font-heading font-bold text-navy-900">No Scheduled Site Visits</h3>
          <p className="text-xs text-navy-500 font-sans max-w-sm mx-auto">
            Browse our verified property portfolio and select "Schedule Site Visit" on any residence to arrange an appointment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const isCancelled = appt.status?.toLowerCase() === "cancelled";
            const apptId = appt._id || appt.id;
            const propTitle = appt.property?.title || appt.propertyTitle || "Property Site Visit";
            const propLocation = appt.property?.location || appt.location || "Ahmedabad, Gujarat";
            const agentName = appt.agent?.name || appt.agentName || "Assigned Advisor";

            return (
              <div key={apptId} className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 font-bold text-xs rounded-lg capitalize ${
                      isCancelled
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : appt.status?.toLowerCase() === "confirmed"
                        ? "bg-forest-50 text-forest-800 border border-forest-200"
                        : "bg-gold-50 text-gold-800 border border-gold-200"
                    }`}
                  >
                    {appt.status || "Pending Confirmation"}
                  </span>
                  <span className="text-xs font-semibold text-navy-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{appt.appointmentDate || appt.date} at {appt.appointmentTime || appt.time}</span>
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-navy-900">{propTitle}</h3>

                <div className="flex items-center text-xs text-navy-500 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span>{propLocation}</span>
                </div>

                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs font-semibold text-navy-700">
                  <div className="flex items-center space-x-1.5 text-forest-800">
                    <User className="w-3.5 h-3.5" />
                    <span>Advisor: {agentName}</span>
                  </div>
                  {isCancelled && (
                    <span className="text-rose-600 font-bold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelled</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduledVisits;
