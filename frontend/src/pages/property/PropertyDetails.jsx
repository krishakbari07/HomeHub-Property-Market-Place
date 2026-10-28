import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Bed, Bath, Maximize2, Heart, Calendar, MessageSquare,
  CheckCircle2, Sparkles, ArrowLeft, Loader2, ShieldCheck, Tag,
  XCircle, ArrowRightLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import { userApi, propertyApi, offerApi } from "../../services/api";
import { formatPrice } from "../../utils/formatPrice";
import ImageWithFallback from "../../components/common/ImageWithFallback";
import Modal from "../../components/common/Modal";

const PropertyDetails = () => {
  const { id } = useParams();
  const { properties, isInWishlist, toggleWishlist, triggerAuthModal, scheduleVisit, submitInquiry } = useProperty();
  const { user, isAuthenticated } = useAuth();
  const { toast, confirm } = useToast();

  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Offer / Bidding state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [userOffer, setUserOffer] = useState(null);
  const [withdrawingOffer, setWithdrawingOffer] = useState(false);
  const [respondingCounter, setRespondingCounter] = useState(false);

  // Agents state
  const [agentsList, setAgentsList] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Form State
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("11:00 AM");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submittingAppt, setSubmittingAppt] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Fetch or find property by ID
  useEffect(() => {
    let isMounted = true;
    const found = properties.find((p) => String(p._id || p.id) === String(id));
    if (found) {
      setProperty(found);
      setActiveImage(found.image);
      setLoadingProperty(false);
    } else {
      setLoadingProperty(true);
      propertyApi
        .getById(id)
        .then((data) => {
          if (isMounted) {
            const prop = data?.data || data;
            setProperty(prop);
            setActiveImage(prop?.image || "");
          }
        })
        .catch((err) => {
          console.warn("Could not fetch property by ID:", err.message);
          if (isMounted) {
            setProperty(null);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingProperty(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id, properties]);

  useEffect(() => {
    // Load registered agents from MongoDB Atlas
    setLoadingAgents(true);
    userApi
      .getAgents()
      .then((data) => {
        const rawList = Array.isArray(data) ? data : (data?.data || []);
        const unique = Array.from(new Map(rawList.map((a) => [String(a._id || a.id), a])).values());
        setAgentsList(unique);
        if (unique.length > 0) {
          setSelectedAgentId(unique[0]._id || unique[0].id);
        }
      })
      .catch((err) => console.warn("Failed to load agents list:", err.message))
      .finally(() => setLoadingAgents(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated && property) {
      const propId = property._id || property.id;
      offerApi
        .getMyOffers()
        .then((list) => {
          const found = (Array.isArray(list) ? list : []).find(
            (o) => String(o.property?._id || o.property?.id || o.property) === String(propId)
          );
          setUserOffer(found || null);
        })
        .catch((err) => console.warn("Failed to load user offers for property:", err.message));
    }
  }, [isAuthenticated, property]);

  if (loadingProperty) {
    return (
      <div className="py-24 bg-ivory-100 min-h-screen flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-sm font-semibold text-navy-700">Loading verified property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-24 bg-ivory-100 min-h-screen text-center space-y-4">
        <h2 className="text-2xl font-heading font-bold text-navy-900">Property Not Found</h2>
        <p className="text-sm text-navy-600">The property you are looking for may have been sold or removed.</p>
        <Link
          to="/buy"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-forest-700 text-white rounded-xl text-sm font-semibold hover:bg-forest-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Catalog</span>
        </Link>
      </div>
    );
  }

  const propId = property._id || property.id;
  const isFavorited = isInWishlist(propId);
  const isRent = property.purpose === "rent" || property.tag === "For Rent" || property.listingType === "rent";
  const displayPrice = property.formattedPrice || (isRent ? `₹${(property.monthlyRent || property.price)?.toLocaleString("en-IN")} /mo` : `₹${property.price?.toLocaleString("en-IN")}`);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to save properties to your wishlist.");
      return;
    }
    toggleWishlist(propId);
  };

  const handleOpenScheduleModal = () => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to book an appointment for a property visit.");
      return;
    }
    setScheduleModalOpen(true);
  };

  const handleOpenInquiryModal = () => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to send an inquiry to the advisor.");
      return;
    }
    setInquiryModalOpen(true);
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!visitDate) {
      toast.warning("Please select a date for your site visit.");
      return;
    }

    setSubmittingAppt(true);
    try {
      await scheduleVisit({
        propertyId: propId,
        propertyTitle: property.title,
        location: property.location || property.city,
        agentId: selectedAgentId || (agentsList[0]?._id || agentsList[0]?.id),
        date: visitDate,
        time: visitTime,
      });

      setScheduleModalOpen(false);
      const msg = `Site visit appointment confirmed with property advisor for ${visitDate} at ${visitTime}!`;
      setSuccessMessage(msg);
      toast.success(msg);
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      toast.error("Failed to book appointment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAppt(false);
    }
  };

  const handleConfirmInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) {
      toast.warning("Please enter your inquiry details.");
      return;
    }

    setSubmittingInquiry(true);
    try {
      await submitInquiry({
        propertyId: propId,
        propertyTitle: property.title,
        message: inquiryMessage,
        agentId: selectedAgentId || (agentsList[0]?._id || agentsList[0]?.id),
      });

      setInquiryModalOpen(false);
      setInquiryMessage("");
      const successText = "Inquiry sent successfully! The advisor can now review your request.";
      setSuccessMessage(successText);
      toast.success(successText);
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err) {
      toast.error("Failed to send inquiry: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleOpenOfferModal = () => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to submit an offer or place a bid on this property.");
      return;
    }

    const myId = user?._id || user?.id;
    const creatorId = property?.createdBy?._id || property?.createdBy || property?.owner?._id || property?.owner?.id || property?.owner;
    const agentId = property?.agent?._id || property?.agent?.id || property?.agent;

    if (myId && (String(myId) === String(creatorId) || String(myId) === String(agentId))) {
      toast.warning("You are listed as the owner or assigned agent of this property and cannot submit offers on your own listing.");
      return;
    }

    setOfferAmount(property?.price ? String(property.price) : "");
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      toast.warning("Please enter a valid positive offer amount.");
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await offerApi.submitOffer({
        propertyId: propId,
        amount: Number(offerAmount),
        note: offerNote,
      });

      const savedOffer = res?.data || res;
      setUserOffer(savedOffer);
      setOfferModalOpen(false);
      setOfferNote("");
      window.dispatchEvent(new Event("homehub_offer_updated"));
      const successMsg = `Your offer of ${formatPrice(Number(offerAmount), { isRental: isRent })} has been submitted! You can track its status in your dashboard.`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);
      setTimeout(() => setSuccessMessage(""), 7000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleWithdrawOffer = async () => {
    if (!userOffer?._id && !userOffer?.id) return;
    const confirmed = await confirm({
      title: "Withdraw Offer",
      message: "Are you sure you want to withdraw your current offer? This action cannot be undone.",
      confirmText: "Withdraw Offer",
      cancelText: "Keep Offer",
      isDanger: true,
    });
    if (!confirmed) return;

    setWithdrawingOffer(true);
    try {
      const res = await offerApi.withdrawOffer(userOffer._id || userOffer.id);
      setUserOffer(res?.data || res);
      window.dispatchEvent(new Event("homehub_offer_updated"));
      setSuccessMessage("Your offer was withdrawn successfully.");
      toast.success("Your offer was withdrawn successfully.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to withdraw offer.");
    } finally {
      setWithdrawingOffer(false);
    }
  };

  const handleCounterResponse = async (action) => {
    if (!userOffer?._id && !userOffer?.id) return;
    const counterDisplay = userOffer.formattedCounterAmount || formatPrice(userOffer.counterAmount, { isRental: isRent });
    const isAccept = action === "accept";
    const confirmed = await confirm({
      title: isAccept ? "Accept Counteroffer" : "Decline Counteroffer",
      message: isAccept
        ? `Are you sure you want to accept the counteroffer of ${counterDisplay}?`
        : `Are you sure you want to decline this counteroffer of ${counterDisplay}?`,
      confirmText: isAccept ? "Accept Counteroffer" : "Decline Counteroffer",
      cancelText: "Cancel",
      isDanger: !isAccept,
    });
    if (!confirmed) return;

    setRespondingCounter(true);
    try {
      const res = await offerApi.respondToCounter(userOffer._id || userOffer.id, action);
      setUserOffer(res?.data || res);
      window.dispatchEvent(new Event("homehub_offer_updated"));
      const msg = action === "accept" ? "Counteroffer accepted!" : "Counteroffer declined.";
      setSuccessMessage(msg);
      toast.success(msg);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to respond to counteroffer.");
    } finally {
      setRespondingCounter(false);
    }
  };

  return (
    <div className="py-10 bg-ivory-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={isRent ? "/rent" : "/buy"}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-navy-700 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property Catalog</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-semibold text-navy-500">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>Verified Listing ID: {String(propId).slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-forest-50 border border-forest-200 text-forest-900 rounded-2xl flex items-center space-x-3 font-semibold text-sm shadow-subtle animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* High-Resolution Architectural Gallery Header */}
        <div className="space-y-4">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-card bg-navy-950 border border-ivory-300">
            <ImageWithFallback
              src={activeImage || property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex space-x-2">
              <span className="px-4 py-1.5 bg-navy-800 text-white font-bold text-xs rounded-xl shadow-subtle border border-navy-700">
                {property.type || property.propertyType || "Luxury Residence"}
              </span>
              <span className="px-4 py-1.5 bg-forest-700 text-white font-bold text-xs rounded-xl shadow-subtle">
                {isRent ? "For Rent" : "For Sale"}
              </span>
            </div>

            <button
              onClick={handleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-2xl shadow-card backdrop-blur-md transition-all ${
                isFavorited
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-white/90 text-navy-800 hover:bg-white hover:text-rose-600"
              }`}
              title={isFavorited ? "Saved to Wishlist" : "Save to Wishlist"}
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Thumbnail Selector */}
          {property.images && property.images.length > 0 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[property.image, ...property.images].filter(Boolean).map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-28 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === imgUrl ? "border-forest-700 scale-102 shadow-subtle" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-ivory-200 pb-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-heading font-extrabold text-navy-900 tracking-tight">{property.title}</h1>
                  <p className="text-sm font-semibold text-navy-500 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>{property.location || property.city || "Ahmedabad, Gujarat"}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-3xl font-heading font-extrabold text-forest-700 block">
                    {displayPrice}
                  </span>
                  <span className="text-xs font-semibold text-navy-400">All taxes & government fees applicable</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-ivory-200">
                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                  <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-bold uppercase tracking-wider">Bedrooms</p>
                    <p className="text-sm font-heading font-extrabold text-navy-900">{property.bedrooms || 3} BHK</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                  <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-bold uppercase tracking-wider">Bathrooms</p>
                    <p className="text-sm font-heading font-extrabold text-navy-900">{property.bathrooms || 2} Baths</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-ivory-50 border border-ivory-200">
                  <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 font-bold uppercase tracking-wider">Super Area</p>
                    <p className="text-sm font-heading font-extrabold text-navy-900">{property.areaSqFt || property.area || 1800} sq.ft</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-heading font-bold text-navy-900">Residence Overview</h3>
                <p className="text-sm text-navy-700 leading-relaxed font-sans font-medium">
                  {property.description || "Architecturally refined residence built with premium materials, private layout, generous natural light, and strategic accessibility."}
                </p>
              </div>

              {/* Amenities & Features */}
              <div className="space-y-3 pt-4 border-t border-ivory-200">
                <h3 className="text-lg font-heading font-bold text-navy-900">Amenities & Features</h3>
                <div className="flex flex-wrap gap-2.5">
                  {(property.amenities?.length > 0 ? property.amenities : [
                    "24/7 Gated Security", "Reserved Parking", "High-Speed Elevators", "Clubhouse & Gym", "Power Backup", "Italian Marble Flooring"
                  ]).map((amenity, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-ivory-100 border border-ivory-200 text-navy-800 font-semibold text-xs rounded-xl flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-ivory-300 shadow-card space-y-6 sticky top-24">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-widest block">
                  Private Acquisition Service
                </span>
                <h3 className="text-xl font-heading font-extrabold text-navy-900">Interested in this property?</h3>
                <p className="text-xs text-navy-500 font-sans leading-relaxed">
                  Schedule an escorted site visit or dispatch a private inquiry directly to our certified real estate advisor.
                </p>
              </div>

              {/* AI Index Badge */}
              <div className="bg-gold-50/70 p-4 rounded-2xl border border-gold-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-gold-600" />
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">AI Match Index</h4>
                    <p className="text-[11px] text-navy-600 font-medium">High Match for Gujarat Prime</p>
                  </div>
                </div>
                <span className="text-xl font-heading font-extrabold text-gold-700">{property.aiMatchScore || 95}%</span>
              </div>

              {/* Active User Offer Banner (If user has an active offer) */}
              {userOffer && (
                <div className="p-4 rounded-2xl border border-forest-200 bg-forest-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-600 flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-forest-700" />
                      <span>Your Submitted Offer</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        userOffer.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : userOffer.status === "rejected"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : userOffer.status === "countered"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : userOffer.status === "withdrawn"
                          ? "bg-slate-100 text-slate-700 border-slate-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {userOffer.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-navy-500 font-medium">Offered Amount</p>
                      <p className="text-xl font-extrabold text-forest-800">
                        {userOffer.formattedAmount || formatPrice(userOffer.amount, { isRental: isRent })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-navy-400 font-medium">Asking Price</p>
                      <p className="text-xs font-bold text-navy-700 line-through">
                        {userOffer.formattedAskingPrice || property.formattedPrice}
                      </p>
                    </div>
                  </div>

                  {/* Counteroffer details if countered */}
                  {userOffer.status === "countered" && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                      <div className="flex items-center space-x-1 text-purple-900 font-bold text-xs">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-purple-700" />
                        <span>Seller Counteroffer Proposed</span>
                      </div>
                      <p className="text-lg font-black text-purple-800">
                        {userOffer.formattedCounterAmount || formatPrice(userOffer.counterAmount, { isRental: isRent })}
                      </p>
                      {userOffer.counterNote && (
                        <p className="text-xs text-purple-700 italic">"{userOffer.counterNote}"</p>
                      )}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleCounterResponse("accept")}
                          disabled={respondingCounter}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-60"
                        >
                          Accept Counter
                        </button>
                        <button
                          onClick={() => handleCounterResponse("reject")}
                          disabled={respondingCounter}
                          className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Withdrawal option for pending or countered */}
                  {(userOffer.status === "pending" || userOffer.status === "countered") && (
                    <button
                      onClick={handleWithdrawOffer}
                      disabled={withdrawingOffer}
                      className="w-full text-center text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors pt-1 flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{withdrawingOffer ? "Withdrawing..." : "Withdraw My Offer"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Bidding / Make an Offer Action */}
                {property.status && property.status !== "Available" ? (
                  <div className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold text-center">
                    Offers Closed ({property.status})
                  </div>
                ) : (
                  <button
                    onClick={handleOpenOfferModal}
                    className="w-full bg-gold-600 hover:bg-gold-700 text-navy-950 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-subtle border border-gold-700 text-sm active:scale-98"
                  >
                    <Tag className="w-4 h-4 text-navy-900" />
                    <span>{userOffer && userOffer.status === "pending" ? "Update My Offer / Bid" : isRent ? "Make a Rental Offer" : "Make an Offer / Bid"}</span>
                  </button>
                )}

                <button
                  onClick={handleOpenScheduleModal}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-subtle border border-forest-800 text-sm active:scale-98"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Site Visit</span>
                </button>

                <button
                  onClick={handleOpenInquiryModal}
                  className="w-full bg-ivory-100 hover:bg-ivory-200 text-navy-900 font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all border border-ivory-300 text-sm"
                >
                  <MessageSquare className="w-4 h-4 text-forest-700" />
                  <span>Send Private Inquiry</span>
                </button>
              </div>

              {/* Listing Creator & Assigned Advisor Card */}
              <div className="pt-4 border-t border-ivory-200 space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center font-bold text-sm shadow-subtle shrink-0">
                    {property?.creatorRole?.toLowerCase() === "admin"
                      ? "A"
                      : (property?.owner?.name?.[0] || property?.ownerName?.[0] || "S").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
                      Listing Owner
                    </span>
                    <p className="text-xs font-bold text-navy-900 truncate">
                      {property?.creatorRole?.toLowerCase() === "admin"
                        ? "HomeHub Administration"
                        : (property?.owner?.name || property?.ownerName || "Verified Seller")}
                    </p>
                    <p className="text-[11px] text-forest-700 font-semibold capitalize">
                      {property?.creatorRole?.toLowerCase() === "admin"
                        ? "System Administrator"
                        : property?.creatorRole?.toLowerCase() === "agent"
                        ? "Certified Real Estate Advisor"
                        : "Verified Property Owner"}
                    </p>
                  </div>
                </div>

                {property?.agent && (
                  <div className="flex items-center space-x-3 pt-2 border-t border-ivory-100">
                    <div className="w-8 h-8 rounded-lg bg-navy-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(property.agent.name?.[0] || "A").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
                        Assigned Advisory Partner
                      </span>
                      <p className="text-xs font-bold text-navy-900 truncate">{property.agent.name}</p>
                      <p className="text-[11px] text-navy-500 font-medium truncate">
                        {property.agent.agencyName || "Licensed HomeHub Broker"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Visit Modal */}
      <Modal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule Private Site Visit">
        <form onSubmit={handleConfirmSchedule} className="space-y-4" noValidate>
          <p className="text-xs text-navy-600">
            Scheduling escorted visit for: <span className="font-bold text-navy-900">{property.title}</span>
          </p>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">Select Property Advisor</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full border border-ivory-300 p-3 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
              disabled={loadingAgents}
            >
              {loadingAgents ? (
                <option value="">Loading advisors...</option>
              ) : (
                agentsList.map((agent) => (
                  <option key={agent._id || agent.id} value={agent._id || agent.id}>
                    {agent.name} {agent.agencyName ? `— ${agent.agencyName}` : "— Verified HomeHub Advisor"}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">Preferred Date *</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full border border-ivory-300 p-3 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">Preferred Time Slot *</label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full border border-ivory-300 p-3 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
            >
              <option value="10:00 AM">10:00 AM (Morning)</option>
              <option value="11:30 AM">11:30 AM (Morning)</option>
              <option value="02:30 PM">02:30 PM (Afternoon)</option>
              <option value="05:00 PM">05:00 PM (Evening)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submittingAppt}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-subtle border border-forest-800 disabled:opacity-60"
          >
            {submittingAppt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            <span>{submittingAppt ? "Confirming Visit..." : "Confirm Site Visit"}</span>
          </button>
        </form>
      </Modal>

      {/* Send Inquiry Modal */}
      <Modal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} title="Send Private Property Inquiry">
        <form onSubmit={handleConfirmInquiry} className="space-y-4" noValidate>
          <p className="text-xs text-navy-600">
            Property: <span className="font-bold text-navy-900">{property.title}</span>
          </p>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">Your Message or Query *</label>
            <textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Ask about floor plans, payment schedule, possession timeline, or parking details..."
              className="w-full border border-ivory-300 p-3 rounded-xl text-sm h-32 font-medium bg-ivory-50 outline-none focus:border-forest-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submittingInquiry}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3.5 rounded-xl text-sm shadow-subtle transition-all border border-forest-800 disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {submittingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            <span>{submittingInquiry ? "Dispatching..." : "Send Inquiry"}</span>
          </button>
        </form>
      </Modal>

      {/* Make an Offer / Place a Bid Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={isRent ? "Submit Monthly Rental Offer" : "Place Property Purchase Bid"}
      >
        <form onSubmit={handleSubmitOffer} className="space-y-4" noValidate>
          <div className="bg-ivory-100 p-4 rounded-xl border border-ivory-200 space-y-1">
            <p className="text-xs text-navy-500 font-semibold uppercase tracking-wider">Property Reference</p>
            <h4 className="text-sm font-bold text-navy-900 leading-tight">{property.title}</h4>
            <div className="flex items-center justify-between pt-2 border-t border-ivory-200 text-xs">
              <span className="text-navy-600 font-medium">Official Listed Asking Price:</span>
              <span className="font-extrabold text-navy-950 text-sm">
                {property.formattedPrice || formatPrice(property.price, { isRental: isRent })}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">
              Your Offer Amount (₹ {isRent ? "per month" : "total purchase"}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder={isRent ? "e.g. 25000" : "e.g. 28000000"}
                className="w-full pl-8 pr-3 py-3 border border-ivory-300 rounded-xl text-sm font-bold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
                required
              />
            </div>
            {offerAmount && !isNaN(Number(offerAmount)) && Number(offerAmount) > 0 && (
              <p className="text-xs text-forest-700 font-bold mt-1.5 flex items-center space-x-1">
                <span>Offer Preview:</span>
                <span className="underline">{formatPrice(Number(offerAmount), { isRental: isRent })}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1">
              Offer Terms or Note to Owner (Optional)
            </label>
            <textarea
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="e.g. Flexible closing timeline, pre-approved financing in place, or preferred lease start date..."
              className="w-full border border-ivory-300 p-3 rounded-xl text-sm h-24 font-medium bg-ivory-50 outline-none focus:border-forest-600"
              maxLength={1000}
            />
          </div>

          <div className="p-3 bg-gold-50/70 border border-gold-200 rounded-xl flex items-start space-x-2 text-[11px] text-navy-700">
            <ShieldCheck className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
            <span>
              Your offer is directly conveyed to the verified listing owner and assigned advisor. You can review or withdraw this offer anytime from your dashboard before it is accepted.
            </span>
          </div>

          <button
            type="submit"
            disabled={submittingOffer}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-subtle transition-all border border-forest-800 disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {submittingOffer ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tag className="w-4 h-4 text-white" />
            )}
            <span>{submittingOffer ? "Submitting Offer..." : "Submit Binding Offer"}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
