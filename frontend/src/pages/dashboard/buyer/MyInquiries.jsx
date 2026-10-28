import React from "react";
import { MessageSquare, Clock, Building2, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProperty } from "../../../context/PropertyContext";
import EmptyState from "../../../components/common/EmptyState";

const MyInquiries = () => {
  const { inquiries } = useProperty();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Client Inquiries & Dispatches
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Track communication logs and genuine responses from licensed property advisors.
          </p>
        </div>
        <div className="w-12 h-12 bg-ivory-100 text-forest-700 border border-ivory-300 rounded-2xl flex items-center justify-center font-bold shadow-subtle">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Active Inquiries"
          description="You have not submitted any property inquiries yet. Browse properties and click 'Send Private Inquiry' to request info."
          actionText="Browse Luxury Properties"
          actionLink="/buy"
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const inqId = inq._id || inq.id;
            const propTitle = inq.propertyTitle || inq.property?.title || "Property Inquiry";
            const propId = inq.property?._id || inq.property?.id || inq.property;
            const dateStr = inq.createdAt
              ? new Date(inq.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            const isResponded = inq.status === "Responded" || Boolean(inq.response);

            return (
              <div key={inqId} className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-forest-700" />
                    <h3 className="font-heading font-bold text-base text-navy-900">{propTitle}</h3>
                    {propId && (
                      <Link
                        to={`/property/${propId}`}
                        className="text-forest-700 hover:text-forest-800 text-xs font-semibold inline-flex items-center gap-0.5 ml-2 hover:underline"
                        title="View Property"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isResponded
                        ? "bg-forest-100 text-forest-800 border border-forest-200"
                        : inq.status === "Closed"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-gold-50 text-gold-700 border border-gold-200"
                    }`}
                  >
                    {inq.status || (isResponded ? "Responded" : "Pending Review")}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider block">
                    Your Question:
                  </span>
                  <p className="text-sm text-navy-800 font-sans font-medium bg-ivory-50/70 p-3 rounded-xl border border-ivory-200">
                    "{inq.message}"
                  </p>
                </div>

                {/* Genuine Advisor Response Display */}
                {inq.response && (
                  <div className="space-y-1 bg-forest-50/60 p-3.5 rounded-xl border border-forest-200/80">
                    <div className="flex items-center space-x-1.5 text-forest-800">
                      <CheckCircle className="w-3.5 h-3.5 text-forest-700" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Advisor Response:
                      </span>
                      {inq.respondedAt && (
                        <span className="text-[10px] text-forest-600 font-medium ml-auto">
                          {new Date(inq.respondedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-forest-950 font-medium pt-1">
                      {inq.response}
                    </p>
                  </div>
                )}

                <div className="text-xs text-navy-400 font-medium flex items-center space-x-1 pt-2 border-t border-ivory-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submitted on {dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyInquiries;
