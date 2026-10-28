import React, { useState, useEffect } from "react";
import { Users, Phone, Mail, Loader2, MapPin } from "lucide-react";
import { userApi, appointmentApi } from "../../../services/api";
import { formatClientBudget } from "../../../utils/formatPrice";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Prefer dedicated CRM clients endpoint with rich populated data
    userApi
      .getAgentClients()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data?.clients || [];
        if (list.length > 0) {
          const formatted = list.map((c) => ({
            ...c,
            type: (c.role || c.type || "BUYER").toUpperCase(),
            budget: formatClientBudget(c),
            city: c.city || c.preferredCity || "Ahmedabad",
          }));
          setClients(formatted);
          setLoading(false);
          return;
        }

        // Fallback to appointment list aggregation
        return appointmentApi.getAgentAppointments().then((appts) => {
          if (!isMounted) return;
          const apptList = Array.isArray(appts) ? appts : [];
          const clientMap = new Map();

          apptList.forEach((a) => {
            const userObj = a.user;
            const uId = userObj?._id || userObj?.id || a.userName;
            if (uId && !clientMap.has(uId)) {
              const rawRole = (userObj?.role || "buyer").toLowerCase();
              const normRole = rawRole === "rental" ? "renter" : rawRole;
              clientMap.set(uId, {
                id: uId,
                name: userObj?.name || a.userName || "Client Lead",
                email: userObj?.email || a.userEmail || "",
                phone: userObj?.phone || a.userPhone || "+91 98765 00000",
                role: normRole,
                type: normRole.toUpperCase(),
                city: userObj?.preferredCity || a.location || "Ahmedabad",
                budget: formatClientBudget(userObj),
              });
            }
          });

          setClients(Array.from(clientMap.values()));
        });
      })
      .catch((err) => {
        console.warn("Failed to load clients:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getBadgeStyle = (type = "") => {
    const t = type.toLowerCase();
    if (t === "renter" || t === "rental") {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (t === "seller") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-forest-50 text-forest-700 border-forest-100";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900">Clients CRM</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-50 text-forest-700 border border-forest-200">
              {clients.length} Active
            </span>
          </div>
          <p className="text-navy-600 text-xs sm:text-sm mt-1">
            Manage active buyers, renters, and estate seekers with verified budget parameters.
          </p>
        </div>
        <div className="w-12 h-12 bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold self-start sm:self-auto shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-ivory-300 shadow-card">
        {loading ? (
          <div className="py-12 text-center text-navy-500 font-semibold text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-forest-700" />
            <span>Loading verified client records...</span>
          </div>
        ) : clients.length > 0 ? (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory-100 text-navy-700 font-bold uppercase text-[11px] tracking-wider border-b border-ivory-200">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Client Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Budget / Value</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5 text-right rounded-r-xl">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200 font-semibold text-navy-800">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-ivory-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-navy-900">
                        <div className="text-sm">{c.name}</div>
                        <div className="text-[11px] text-navy-500 font-normal">{c.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-3 py-1 border rounded-full text-xs font-extrabold tracking-wide ${getBadgeStyle(
                            c.type
                          )}`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-forest-700">
                        {c.budget}
                      </td>
                      <td className="p-3.5 text-navy-600 flex items-center space-x-1 pt-4">
                        <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span>{c.city}</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-2 min-h-[38px] bg-ivory-200 hover:bg-ivory-300 text-navy-900 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors"
                            aria-label={`Call ${c.name}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-forest-700" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`mailto:${c.email}`}
                            className="p-2 min-h-[38px] bg-ivory-100 hover:bg-ivory-200 text-navy-800 rounded-lg text-xs font-bold inline-flex items-center space-x-1 border border-ivory-300 transition-colors"
                            aria-label={`Email ${c.name}`}
                          >
                            <Mail className="w-3.5 h-3.5 text-navy-600" />
                            <span>Email</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View (< 768px) */}
            <div className="md:hidden space-y-3">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="bg-ivory-50/70 border border-ivory-300 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-navy-900 text-base leading-snug">{c.name}</h3>
                      <p className="text-xs text-navy-500 font-normal break-all">{c.email}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 border rounded-full text-[11px] font-extrabold tracking-wide shrink-0 ${getBadgeStyle(
                        c.type
                      )}`}
                    >
                      {c.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-ivory-200">
                    <div>
                      <span className="text-navy-500 block text-[10px] uppercase font-bold tracking-wider">
                        Budget / Value
                      </span>
                      <span className="font-extrabold text-forest-700 text-sm">
                        {c.budget}
                      </span>
                    </div>
                    <div>
                      <span className="text-navy-500 block text-[10px] uppercase font-bold tracking-wider">
                        Preferred City
                      </span>
                      <span className="font-semibold text-navy-800 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-navy-400 shrink-0" />
                        <span>{c.city}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-ivory-200">
                    <a
                      href={`tel:${c.phone}`}
                      className="flex-1 py-2.5 bg-ivory-200 hover:bg-ivory-300 text-navy-900 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-forest-700" />
                      <span>Call Client</span>
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="flex-1 py-2.5 bg-white hover:bg-ivory-100 text-navy-800 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-1.5 border border-ivory-300 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-navy-600" />
                      <span>Email Client</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-navy-500 text-xs font-semibold space-y-2">
            <Users className="w-8 h-8 text-navy-300 mx-auto" />
            <p>No active client leads registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
