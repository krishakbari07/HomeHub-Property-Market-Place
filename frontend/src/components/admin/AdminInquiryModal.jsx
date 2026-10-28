import React, { useState } from "react";
import { X, Mail, Phone, Calendar, Building2, ExternalLink, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminInquiryModal({
  isOpen = false,
  inquiry = null,
  onStatusChange,
  onClose,
}) {
  const [responseText, setResponseText] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !inquiry) return null;

  const inquiryId = inquiry._id || inquiry.id;
  const propId = inquiry.property?._id || inquiry.property?.id || inquiry.property;
  const propTitle = inquiry.propertyTitle || inquiry.property?.title || "Marketplace Inquiry";

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    setIsSending(true);
    try {
      await onStatusChange(inquiryId, "Responded", responseText.trim());
      setResponseText("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] font-semibold tracking-wider text-[#D5AD72] uppercase block">
              Inquiry Dossier
            </span>
            <h3 className="font-heading font-bold text-base text-slate-900 mt-0.5">
              {inquiry.userName || "Guest Visitor"}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Received:{" "}
                {inquiry.createdAt
                  ? new Date(inquiry.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recently"}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a
                href={`mailto:${inquiry.userEmail}`}
                className="hover:text-[#315C4B] hover:underline truncate"
              >
                {inquiry.userEmail || "No email provided"}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <a
                href={`tel:${inquiry.userPhone}`}
                className="hover:text-[#315C4B] hover:underline"
              >
                {inquiry.userPhone || "Not specified"}
              </a>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Referenced Property
            </label>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-[#315C4B] shrink-0" />
                <span className="font-medium text-slate-800 truncate">
                  {propTitle}
                </span>
              </div>
              {propId && (
                <Link
                  to={`/property/${propId}`}
                  target="_blank"
                  className="text-[#315C4B] hover:text-[#254538] p-1 shrink-0"
                  title="View property details in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Inquiry Message */}
          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Inquiry Message
            </label>
            <div className="p-3 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] text-slate-800 font-sans leading-relaxed text-xs">
              {inquiry.message || "No message content provided."}
            </div>
          </div>

          {/* Existing Advisor Response if present */}
          {inquiry.response && (
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Dispatched Advisor Response
              </label>
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs">
                {inquiry.response}
              </div>
            </div>
          )}

          {/* Reply Textarea */}
          <div className="space-y-1.5 text-xs">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              Reply to Client
            </label>
            <textarea
              rows={3}
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your official response to notify the client in-app..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#315C4B] bg-slate-50/50"
            />
            {responseText.trim() && (
              <button
                type="button"
                onClick={handleSendResponse}
                disabled={isSending}
                className="w-full py-2 bg-[#315C4B] hover:bg-[#254538] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending..." : "Send Response & Notify Client"}</span>
              </button>
            )}
          </div>

          {/* Status Updater */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Status:</span>
              <select
                value={inquiry.status || "Pending"}
                onChange={(e) => onStatusChange(inquiryId, e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#315C4B]"
              >
                <option value="Pending">Pending</option>
                <option value="Responded">Responded</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
