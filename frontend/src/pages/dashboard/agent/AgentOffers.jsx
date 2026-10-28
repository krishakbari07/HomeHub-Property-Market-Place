import React, { useState, useEffect } from "react";
import {
  FileText, CheckCircle2, XCircle, ArrowRightLeft, ShieldCheck,
  Loader2, Tag, Clock, User
} from "lucide-react";
import { offerApi } from "../../../services/api";
import { formatPrice } from "../../../utils/formatPrice";
import { useToast } from "../../../context/ToastContext";
import Modal from "../../../components/common/Modal";

const AgentOffers = () => {
  const { toast } = useToast();
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState("");
  const [activeActionOffer, setActiveActionOffer] = useState(null);
  const [modalType, setModalType] = useState(""); // 'accept', 'reject', 'counter', 'history'
  const [counterAmount, setCounterAmount] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOffers = () => {
    setLoading(true);
    offerApi
      .getAgentOffers()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setOffersList(list);
      })
      .catch((err) => {
        console.warn("Failed to load agent offers:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openActionModal = (offer, type) => {
    setActiveActionOffer(offer);
    setModalType(type);
    setActionNote("");
    if (type === "counter") {
      setCounterAmount(offer.amount ? String(offer.amount) : "");
    }
  };

  const closeActionModal = () => {
    setActiveActionOffer(null);
    setModalType("");
    setActionNote("");
    setCounterAmount("");
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!activeActionOffer) return;

    setIsSubmitting(true);
    try {
      const offerId = activeActionOffer._id || activeActionOffer.id;
      if (modalType === "accept") {
        await offerApi.acceptOffer(offerId, actionNote);
        const msg = "Offer accepted successfully on behalf of owner.";
        setActionAlert(msg);
        toast.success(msg);
      } else if (modalType === "reject") {
        await offerApi.rejectOffer(offerId, actionNote);
        const msg = "Offer declined.";
        setActionAlert(msg);
        toast.info(msg);
      } else if (modalType === "counter") {
        if (!counterAmount || isNaN(Number(counterAmount)) || Number(counterAmount) <= 0) {
          toast.warning("Please enter a valid positive counteroffer amount.");
          setIsSubmitting(false);
          return;
        }
        await offerApi.counterOffer(offerId, {
          counterAmount: Number(counterAmount),
          counterNote: actionNote,
        });
        const msg = "Counteroffer dispatched to the client.";
        setActionAlert(msg);
        toast.success(msg);
      }
      closeActionModal();
      window.dispatchEvent(new Event("homehub_offer_updated"));
      loadOffers();
      setTimeout(() => setActionAlert(""), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to process offer action.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status = "") => {
    const s = status.toLowerCase();
    switch (s) {
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "countered":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "withdrawn":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ivory-300 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900">Managed Listing Offers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-50 text-forest-700 border border-forest-200">
              {offersList.length} Active Bids
            </span>
          </div>
          <p className="text-navy-600 text-xs sm:text-sm mt-1">
            Review and negotiate purchase and rental bids on properties under your authorized broker management.
          </p>
        </div>
        <div className="w-12 h-12 bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center font-bold self-start sm:self-auto shrink-0">
          <Tag className="w-6 h-6" />
        </div>
      </div>

      {actionAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-subtle animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-navy-500 text-xs font-semibold flex items-center justify-center space-x-2 border border-ivory-300 shadow-card">
          <Loader2 className="w-5 h-5 animate-spin text-forest-700" />
          <span>Loading managed property offers...</span>
        </div>
      ) : offersList.length > 0 ? (
        <div className="space-y-4">
          {offersList.map((off) => {
            const isRental = off.offerType === "rent";
            const canManage = off.status === "pending" || off.status === "countered";

            return (
              <div
                key={off._id || off.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-ivory-300 shadow-card space-y-4 hover:border-forest-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-ivory-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-ivory-100 text-navy-700">
                        {isRental ? "Rental Offer" : "Purchase Offer"}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          off.status
                        )}`}
                      >
                        {off.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-navy-900 leading-snug">
                      {off.property?.title || "Property Listing"}
                    </h3>

                    <div className="text-[11px] text-navy-600 font-medium flex items-center space-x-2 pt-0.5">
                      <span className="font-bold text-navy-700">Listing:</span>
                      <span>
                        {off.property?.creatorRole?.toLowerCase() === "agent"
                          ? "Your Exclusive Agent Portfolio"
                          : `Seller Listing (Delegated by ${off.property?.owner?.name || off.seller?.name || "Seller"})`}
                      </span>
                    </div>

                    <p className="text-xs text-navy-500 font-medium flex items-center space-x-1.5 flex-wrap">
                      <User className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>Client:</span>
                      <span className="font-bold text-navy-800">{off.buyer?.name || "Client"}</span>
                      {off.buyer?.phone && (
                        <span className="text-navy-400">• {off.buyer.phone}</span>
                      )}
                      {off.buyer?.email && (
                        <span className="text-navy-400">• {off.buyer.email}</span>
                      )}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-forest-50/50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                    <span className="text-xs text-navy-500 block uppercase font-bold tracking-wider sm:hidden">
                      Offer Amount:
                    </span>
                    <span className="text-2xl font-black text-forest-700 block">
                      {off.formattedAmount || formatPrice(off.amount, { isRental })}
                    </span>
                    <p className="text-xs text-navy-400 font-semibold line-through">
                      Asking: {off.formattedAskingPrice || formatPrice(off.askingPrice, { isRental })}
                    </p>
                  </div>
                </div>

                {off.note && (
                  <div className="p-3 bg-ivory-50 rounded-xl text-xs text-navy-700 italic border border-ivory-200">
                    Client Note: "{off.note}"
                  </div>
                )}

                {off.status === "countered" && off.counterAmount && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-900 block">Current Counteroffer:</span>
                      <span className="text-sm font-extrabold text-purple-700">
                        {off.formattedCounterAmount || formatPrice(off.counterAmount, { isRental })}
                      </span>
                      {off.counterNote && <p className="text-purple-600 italic mt-0.5">"{off.counterNote}"</p>}
                    </div>
                    <span className="text-[11px] text-purple-700 font-semibold">Awaiting Client Response</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-navy-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted on {new Date(off.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {off.history?.length > 1 && (
                      <button
                        onClick={() => openActionModal(off, "history")}
                        className="text-forest-700 hover:underline ml-2"
                      >
                        Audit History ({off.history.length})
                      </button>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex items-center space-x-2 flex-wrap">
                      <button
                        onClick={() => openActionModal(off, "accept")}
                        className="flex-1 sm:flex-none px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-subtle min-h-[38px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Offer</span>
                      </button>

                      {off.status === "pending" && (
                        <button
                          onClick={() => openActionModal(off, "counter")}
                          className="flex-1 sm:flex-none px-4 py-2 bg-ivory-200 hover:bg-ivory-300 text-navy-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px]"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Counter</span>
                        </button>
                      )}

                      <button
                        onClick={() => openActionModal(off, "reject")}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-navy-500 text-xs font-semibold space-y-2 border border-ivory-300 shadow-card">
          <FileText className="w-8 h-8 text-navy-300 mx-auto" />
          <p>No active price offers on your managed properties.</p>
        </div>
      )}

      {/* Confirmation & Counter Modal */}
      {activeActionOffer && (
        <Modal
          isOpen={Boolean(modalType)}
          onClose={closeActionModal}
          title={
            modalType === "accept"
              ? "Confirm Acceptance of Client Offer"
              : modalType === "reject"
              ? "Confirm Declining Client Offer"
              : modalType === "counter"
              ? "Submit Advisor Counteroffer"
              : "Offer Audit History"
          }
        >
          {modalType === "history" ? (
            <div className="space-y-3">
              <div className="divide-y divide-ivory-200">
                {activeActionOffer.history?.map((h, i) => (
                  <div key={i} className="py-2.5 text-xs flex items-start justify-between">
                    <div>
                      <p className="font-bold text-navy-900 capitalize">{h.action.replace("_", " ")}</p>
                      <p className="text-navy-600 font-medium">By {h.actorRole} {h.note ? `— "${h.note}"` : ""}</p>
                    </div>
                    <span className="text-navy-400 text-[11px] shrink-0">
                      {new Date(h.timestamp).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={closeActionModal}
                className="w-full mt-3 py-2.5 bg-ivory-100 hover:bg-ivory-200 text-navy-800 rounded-xl text-xs font-bold"
              >
                Close History
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div className="bg-ivory-50 p-3.5 rounded-xl border border-ivory-200 text-xs space-y-1">
                <p className="font-bold text-navy-900">{activeActionOffer.property?.title}</p>
                <p className="text-navy-600">
                  Client: <span className="font-bold text-navy-800">{activeActionOffer.buyer?.name}</span>
                </p>
                <p className="text-forest-700 font-extrabold text-sm">
                  Offered: {activeActionOffer.formattedAmount || formatPrice(activeActionOffer.amount, { isRental: activeActionOffer.offerType === "rent" })}
                </p>
              </div>

              {modalType === "counter" && (
                <div>
                  <label className="text-xs font-bold text-navy-700 block mb-1">
                    Your Proposed Counteroffer (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-navy-400">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      placeholder="e.g. 24000000"
                      className="w-full pl-8 pr-3 py-2.5 border border-ivory-300 rounded-xl text-sm font-bold text-navy-900 outline-none focus:border-forest-600"
                      required
                    />
                  </div>
                  {counterAmount && !isNaN(Number(counterAmount)) && (
                    <p className="text-xs text-forest-700 font-bold mt-1">
                      Counter Preview: {formatPrice(Number(counterAmount), { isRental: activeActionOffer.offerType === "rent" })}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-navy-700 block mb-1">
                  {modalType === "counter" ? "Note to Client (Optional)" : "Confirmation Note (Optional)"}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Optional details or terms..."
                  className="w-full border border-ivory-300 p-2.5 rounded-xl text-xs font-medium outline-none focus:border-forest-600 h-20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="flex-1 py-2.5 bg-ivory-100 hover:bg-ivory-200 text-navy-800 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-subtle disabled:opacity-60 ${
                    modalType === "accept"
                      ? "bg-forest-700 hover:bg-forest-800"
                      : modalType === "reject"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-navy-900 hover:bg-navy-950"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : modalType === "accept" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : modalType === "reject" ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <ArrowRightLeft className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting
                      ? "Processing..."
                      : modalType === "accept"
                      ? "Confirm Accept"
                      : modalType === "reject"
                      ? "Confirm Decline"
                      : "Send Counteroffer"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AgentOffers;
