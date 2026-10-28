import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ShieldCheck,
  Loader2,
  Clock,
  User,
  Building,
  X,
} from "lucide-react";
import { offerApi } from "../../../services/api";
import { formatPrice } from "../../../utils/formatPrice";
import { useToast } from "../../../context/ToastContext";

export default function AdminOffers() {
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
      .getAdminOffers()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setOffersList(list);
      })
      .catch((err) => {
        console.warn("Failed to load admin offers:", err);
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
        const msg = "Offer accepted successfully.";
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
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Admin Listing Offers & Bids</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-50 text-forest-700 border border-forest-200">
              {offersList.length} Total
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Review and manage client purchase and rental offers submitted on administration-managed property listings.
          </p>
        </div>
        <div className="w-12 h-12 bg-forest-50 text-forest-700 rounded-2xl flex items-center justify-center font-bold self-start sm:self-auto shrink-0">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      {actionAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-sm animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 text-xs font-semibold flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-forest-700" />
          <span>Loading admin listing offers...</span>
        </div>
      ) : offersList.length > 0 ? (
        <div className="space-y-4">
          {offersList.map((off) => {
            const isRental = off.offerType === "rent";
            const canManage = off.status === "pending" || off.status === "countered";

            return (
              <div
                key={off._id || off.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {isRental ? "Rental Offer" : "Purchase Offer"}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          off.status
                        )}`}
                      >
                        {off.status}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-forest-50 text-forest-700 border border-forest-100">
                        Admin Listing
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug">
                      {off.property?.title || "Property Listing"}
                    </h3>

                    <p className="text-xs text-gray-500 font-medium flex items-center space-x-1.5 flex-wrap">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Offered by:</span>
                      <span className="font-bold text-gray-800">{off.buyer?.name || "Client"}</span>
                      {off.buyer?.phone && (
                        <span className="text-gray-400">• {off.buyer.phone}</span>
                      )}
                      {off.buyer?.email && (
                        <span className="text-gray-400">• {off.buyer.email}</span>
                      )}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-forest-50/50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                    <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider sm:hidden">
                      Offer Amount:
                    </span>
                    <span className="text-2xl font-black text-forest-700 block">
                      {off.formattedAmount || formatPrice(off.amount, { isRental })}
                    </span>
                    <p className="text-xs text-gray-400 font-semibold line-through">
                      Listed Price: {off.formattedAskingPrice || formatPrice(off.askingPrice, { isRental })}
                    </p>
                  </div>
                </div>

                {/* Offer Note or Counter details */}
                {off.note && (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-100">
                    "{off.note}"
                  </div>
                )}

                {off.status === "countered" && off.counterAmount && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-900 block">Proposed Counteroffer:</span>
                      <span className="text-sm font-extrabold text-purple-700">
                        {off.formattedCounterAmount || formatPrice(off.counterAmount, { isRental })}
                      </span>
                      {off.counterNote && <p className="text-purple-600 italic mt-0.5">"{off.counterNote}"</p>}
                    </div>
                    <span className="text-[11px] text-purple-700 font-semibold">Awaiting Client Response</span>
                  </div>
                )}

                {/* Footer and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted on {new Date(off.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {off.history?.length > 1 && (
                      <button
                        onClick={() => openActionModal(off, "history")}
                        className="text-forest-700 hover:underline ml-2"
                      >
                        View History ({off.history.length} updates)
                      </button>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex items-center space-x-2 flex-wrap">
                      <button
                        onClick={() => openActionModal(off, "accept")}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-sm min-h-[38px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Offer</span>
                      </button>

                      {off.status === "pending" && (
                        <button
                          onClick={() => openActionModal(off, "counter")}
                          className="flex-1 sm:flex-none px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px]"
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
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Building className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">No Offers on Admin Listings</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            When clients place bids or submit purchase/rental offers on properties managed by Administration, they will appear here for review.
          </p>
        </div>
      )}

      {/* Action Modal (Accept, Reject, Counter, History) */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === "accept"
                  ? "Accept Client Offer"
                  : modalType === "reject"
                  ? "Decline Client Offer"
                  : modalType === "counter"
                  ? "Submit Counteroffer"
                  : "Offer Transaction History"}
              </h3>
              <button
                onClick={closeActionModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === "history" ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Timeline of updates for offer on{" "}
                  <span className="font-bold text-gray-800">{activeActionOffer?.property?.title}</span>
                </p>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activeActionOffer?.history?.map((h, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-gray-700">{h.action}</span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(h.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {h.amount && (
                        <p className="font-semibold text-forest-700">Amount: ₹{Number(h.amount).toLocaleString("en-IN")}</p>
                      )}
                      {h.note && <p className="text-gray-600 italic">"{h.note}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmAction} className="space-y-4">
                <p className="text-xs text-gray-600">
                  {modalType === "accept" &&
                    "Are you sure you want to accept this offer? This records formal acceptance on this administration listing."}
                  {modalType === "reject" &&
                    "Are you sure you want to decline this offer? The client will be notified of the decision."}
                  {modalType === "counter" &&
                    "Specify your proposed counteroffer amount and any terms for the prospective client."}
                </p>

                {modalType === "counter" && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Proposed Counter Amount (INR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      placeholder="e.g. 2500000"
                      required
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-forest-700"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Optional Note / Comments
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Add any specific context or instructions..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-forest-700 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={closeActionModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 shadow-sm ${
                      modalType === "accept"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : modalType === "reject"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-forest-700 hover:bg-forest-800"
                    }`}
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {modalType === "accept"
                        ? "Confirm Accept"
                        : modalType === "reject"
                        ? "Confirm Decline"
                        : "Send Counteroffer"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
