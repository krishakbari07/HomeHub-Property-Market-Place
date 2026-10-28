import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Tag, XCircle, ArrowRightLeft, ShieldCheck,
  Loader2, Clock, ExternalLink
} from "lucide-react";
import { offerApi } from "../../../services/api";
import { formatPrice } from "../../../utils/formatPrice";
import { useToast } from "../../../context/ToastContext";
import Modal from "../../../components/common/Modal";

const MyOffers = () => {
  const { toast, confirm } = useToast();
  const [offersList, setOffersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState("");
  const [selectedOfferHistory, setSelectedOfferHistory] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadOffers = () => {
    setLoading(true);
    offerApi
      .getMyOffers()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setOffersList(list);
      })
      .catch((err) => {
        console.warn("Failed to load user offers:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleWithdraw = async (offerId) => {
    const confirmed = await confirm({
      title: "Withdraw Offer",
      message: "Are you sure you want to withdraw your offer? This action cannot be undone.",
      confirmText: "Withdraw Offer",
      cancelText: "Keep Offer",
      isDanger: true,
    });
    if (!confirmed) return;

    setProcessingId(offerId);
    try {
      await offerApi.withdrawOffer(offerId);
      window.dispatchEvent(new Event("homehub_offer_updated"));
      const msg = "Your offer was withdrawn successfully.";
      setActionAlert(msg);
      toast.success(msg);
      loadOffers();
      setTimeout(() => setActionAlert(""), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to withdraw offer.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCounterResponse = async (offerId, action, counterDisplay) => {
    const isAccept = action === "accept";
    const confirmed = await confirm({
      title: isAccept ? "Accept Counteroffer" : "Decline Counteroffer",
      message: isAccept
        ? `Accept counteroffer of ${counterDisplay}?`
        : `Decline this counteroffer of ${counterDisplay}?`,
      confirmText: isAccept ? "Accept Counteroffer" : "Decline Counteroffer",
      cancelText: "Cancel",
      isDanger: !isAccept,
    });
    if (!confirmed) return;

    setProcessingId(offerId);
    try {
      await offerApi.respondToCounter(offerId, action);
      window.dispatchEvent(new Event("homehub_offer_updated"));
      const msg = action === "accept" ? "Counteroffer accepted!" : "Counteroffer declined.";
      setActionAlert(msg);
      toast.success(msg);
      loadOffers();
      setTimeout(() => setActionAlert(""), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to respond to counteroffer.");
    } finally {
      setProcessingId(null);
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
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Bids & Offers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {offersList.length} Total
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Track and manage your submitted purchase bids and rental offers in real time.
          </p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold self-start sm:self-auto shrink-0">
          <Tag className="w-6 h-6" />
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
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading your submitted offers...</span>
        </div>
      ) : offersList.length > 0 ? (
        <div className="space-y-4">
          {offersList.map((off) => {
            const isRental = off.offerType === "rent";
            const propId = off.property?._id || off.property?.id || off.property;
            const counterDisplay = off.formattedCounterAmount || formatPrice(off.counterAmount, { isRental });

            return (
              <div
                key={off._id || off.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {isRental ? "Rental Offer" : "Purchase Bid"}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          off.status
                        )}`}
                      >
                        {off.status}
                      </span>
                    </div>

                    <Link
                      to={`/property/${propId}`}
                      className="font-extrabold text-base sm:text-lg text-gray-900 hover:text-indigo-600 transition-colors inline-flex items-center space-x-1 group"
                    >
                      <span>{off.property?.title || "Property Listing"}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                    </Link>

                    <p className="text-xs text-gray-500 font-medium">
                      Location: {off.property?.location || off.property?.city || "Gujarat, India"}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 bg-indigo-50/50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                    <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider sm:hidden">
                      Your Offer:
                    </span>
                    <span className="text-2xl font-black text-indigo-700 block">
                      {off.formattedAmount || formatPrice(off.amount, { isRental })}
                    </span>
                    <p className="text-xs text-gray-400 font-semibold line-through">
                      Asking: {off.formattedAskingPrice || formatPrice(off.askingPrice, { isRental })}
                    </p>
                  </div>
                </div>

                {/* Offer Note */}
                {off.note && (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-100">
                    Your note: "{off.note}"
                  </div>
                )}

                {/* Counteroffer details if countered */}
                {off.status === "countered" && off.counterAmount && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-purple-900 font-bold text-xs">
                        <ArrowRightLeft className="w-4 h-4 text-purple-700 shrink-0" />
                        <span>Seller Proposed a Counteroffer</span>
                      </div>
                      <span className="text-xs font-extrabold text-purple-800">Action Required</span>
                    </div>

                    <div>
                      <span className="text-2xl font-black text-purple-900 block">
                        {counterDisplay}
                      </span>
                      {off.counterNote && (
                        <p className="text-xs text-purple-700 italic mt-1">"{off.counterNote}"</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-1 flex-wrap">
                      <button
                        onClick={() => handleCounterResponse(off._id || off.id, "accept", counterDisplay)}
                        disabled={processingId === (off._id || off.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-60 min-h-[38px]"
                      >
                        Accept Counter
                      </button>
                      <button
                        onClick={() => handleCounterResponse(off._id || off.id, "reject", counterDisplay)}
                        disabled={processingId === (off._id || off.id)}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all disabled:opacity-60 min-h-[38px]"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleWithdraw(off._id || off.id)}
                        disabled={processingId === (off._id || off.id)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 text-xs font-semibold"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer and History */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted on {new Date(off.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {off.history?.length > 1 && (
                      <button
                        onClick={() => setSelectedOfferHistory(off)}
                        className="text-indigo-600 hover:underline ml-2"
                      >
                        View History ({off.history.length})
                      </button>
                    )}
                  </div>

                  {off.status === "pending" && (
                    <button
                      onClick={() => handleWithdraw(off._id || off.id)}
                      disabled={processingId === (off._id || off.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors self-start sm:self-auto flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{processingId === (off._id || off.id) ? "Withdrawing..." : "Withdraw Offer"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 text-xs font-semibold space-y-3 border border-gray-100">
          <Tag className="w-8 h-8 text-gray-300 mx-auto" />
          <p>You haven't submitted any offers or bids yet.</p>
          <Link
            to="/buy"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Explore Verified Properties
          </Link>
        </div>
      )}

      {/* History Modal */}
      {selectedOfferHistory && (
        <Modal
          isOpen={Boolean(selectedOfferHistory)}
          onClose={() => setSelectedOfferHistory(null)}
          title="Offer Audit History"
        >
          <div className="space-y-3">
            <div className="divide-y divide-gray-100">
              {selectedOfferHistory.history?.map((h, i) => (
                <div key={i} className="py-2.5 text-xs flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{h.action.replace("_", " ")}</p>
                    <p className="text-gray-500 font-medium">By {h.actorRole} {h.note ? `— "${h.note}"` : ""}</p>
                  </div>
                  <span className="text-gray-400 text-[11px] shrink-0">
                    {new Date(h.timestamp).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedOfferHistory(null)}
              className="w-full mt-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyOffers;
