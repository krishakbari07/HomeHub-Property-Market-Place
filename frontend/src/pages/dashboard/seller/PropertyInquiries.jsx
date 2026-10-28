import React from "react";
import { MessageSquare, Phone, Mail, Clock, Building2 } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import EmptyState from "../../../components/common/EmptyState";

const PropertyInquiries = () => {
  const { inquiries } = useProperty();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-ivory-300 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-navy-900">Received Buyer Inquiries</h1>
          <p className="text-navy-600 text-sm mt-1">Direct inquiries from verified buyers interested in your published properties.</p>
        </div>
        <div className="w-12 h-12 bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Received Inquiries Yet"
          description="You have not received any buyer inquiries on your listings yet. Ensure your property details are accurate and attractively priced."
          actionText="Manage My Listings"
          actionLink="/seller/properties"
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const inqId = inq._id || inq.id;
            const propTitle = inq.propertyTitle || inq.property?.title || "Property Listing";
            const dateStr = inq.createdAt
              ? new Date(inq.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            return (
              <div key={inqId} className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-navy-900">{inq.userName || "Interested Buyer"}</h3>
                  <span className="text-xs text-navy-500 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-navy-400" />
                    <span>{dateStr}</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-forest-700">Property: {propTitle}</p>
                <p className="text-sm text-navy-700 font-medium bg-ivory-50 p-3 rounded-xl border border-ivory-200">
                  "{inq.message}"
                </p>
                <div className="pt-3 border-t border-ivory-200 flex flex-wrap gap-4 text-xs font-bold text-navy-800">
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-forest-700" />
                    <span>{inq.userPhone || "Not provided"}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-forest-700" />
                    <span>{inq.userEmail || "Not provided"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertyInquiries;
