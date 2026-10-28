import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Calendar, TrendingUp, PlusCircle, ShieldCheck, Loader2, Tag } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useProperty } from "../../../context/PropertyContext";
import { appointmentApi, offerApi } from "../../../services/api";
import DashboardCard from "../../../components/dashboard/DashboardCard";

const AgentDashboard = () => {
  const { user } = useAuth();
  const { properties, inquiries } = useProperty();
  const [agentAppointments, setAgentAppointments] = useState([]);
  const [agentOffersCount, setAgentOffersCount] = useState(0);
  const [loadingAppts, setLoadingAppts] = useState(true);

  useEffect(() => {
    appointmentApi
      .getAgentAppointments()
      .then((data) => {
        setAgentAppointments(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.warn("Failed to load agent appointments:", err))
      .finally(() => setLoadingAppts(false));

    offerApi
      .getAgentOffers()
      .then((data) => {
        setAgentOffersCount((Array.isArray(data) ? data : []).length);
      })
      .catch((err) => console.warn("Failed to load agent offers count:", err));
  }, []);

  // Compute unique clients count based on assigned appointments
  const uniqueClientsCount = new Set(agentAppointments.map((a) => a.user?._id || a.user?.id || a.userName)).size;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-navy-900 text-white rounded-3xl p-8 border border-navy-800 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gold-400">
            <ShieldCheck className="w-4 h-4 text-forest-400" />
            <span>RERA Certified Advisory Portal</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-white mt-1">Advisor Console ({user?.name || "Advisor"})</h1>
          <p className="text-ivory-300 text-sm">
            Manage your high-priority client leads, site visit schedules, and active estate portfolio.
          </p>
        </div>
        <Link
          to="/agent/add-listing"
          className="mt-4 md:mt-0 bg-forest-700 hover:bg-forest-800 text-white font-bold px-6 py-3 rounded-xl shadow-subtle transition-all flex items-center space-x-2 text-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>Add Client Listing</span>
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <DashboardCard
          title="Active Listings"
          value={properties.length}
          change="Portfolio live"
          icon={Building2}
          color="forest"
          link="/agent/listings"
        />
        <DashboardCard
          title="Listing Bids"
          value={`${agentOffersCount} Offers`}
          change="Manage Offers"
          icon={Tag}
          color="gold"
          link="/agent/offers"
        />
        <DashboardCard
          title="Total Clients"
          value={`${uniqueClientsCount} Active`}
          change="Assigned CRM"
          icon={Users}
          color="forest"
          link="/agent/clients"
        />
        <DashboardCard
          title="New Leads"
          value={inquiries.length}
          change="High intent"
          icon={TrendingUp}
          color="gold"
        />
        <DashboardCard
          title="Site Visits"
          value={agentAppointments.length}
          change="Scheduled visits"
          icon={Calendar}
          color="forest"
          link="/agent/appointments"
        />
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
          <h3 className="font-heading font-extrabold text-lg text-navy-900">Upcoming Client Site Visits</h3>
          <Link to="/agent/appointments" className="text-xs font-bold text-forest-700 hover:underline">
            View All Visits
          </Link>
        </div>

        {loadingAppts ? (
          <div className="py-8 text-center text-navy-500 font-semibold text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
            <span>Loading assigned client appointments...</span>
          </div>
        ) : agentAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-100 text-navy-700 font-bold uppercase text-[11px] tracking-wider border-b border-ivory-200">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Client Name</th>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 font-semibold text-navy-800">
                {agentAppointments.map((appt) => {
                  const clientName = appt.user?.name || appt.userName || "Customer";
                  const clientEmail = appt.user?.email || appt.userEmail || "";
                  const clientPhone = appt.user?.phone || appt.userPhone || "";
                  const propTitle = appt.property?.title || appt.propertyTitle || "Property Visit";
                  const isCancelled = appt.status?.toLowerCase() === "cancelled";

                  return (
                    <tr key={appt._id || appt.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-navy-900">
                        <div>{clientName}</div>
                        <div className="text-[10px] text-navy-500 font-normal">
                          {clientEmail} {clientPhone ? `| ${clientPhone}` : ""}
                        </div>
                      </td>
                      <td className="p-3.5 text-navy-700 font-medium">{propTitle}</td>
                      <td className="p-3.5 text-xs text-navy-600">
                        {appt.appointmentDate || appt.date} at {appt.appointmentTime || appt.time}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                            isCancelled
                              ? "bg-rose-100 text-rose-800"
                              : appt.status?.toLowerCase() === "confirmed"
                              ? "bg-forest-50 text-forest-700 border border-forest-100"
                              : "bg-gold-50 text-gold-700 border border-gold-200"
                          }`}
                        >
                          {appt.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-navy-500 text-xs font-semibold">
            No upcoming client site visits assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
