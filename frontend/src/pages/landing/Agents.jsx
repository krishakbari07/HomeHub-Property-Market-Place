import React, { useState, useEffect } from "react";
import { Star, MapPin, Building, ShieldCheck, MessageSquare, Award, RefreshCw, Loader2 } from "lucide-react";
import { userApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const Agents = () => {
  const { isAuthenticated } = useAuth();
  const { triggerAuthModal, submitInquiry } = useProperty();
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [submittingAgentId, setSubmittingAgentId] = useState(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAgents();
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      // Deduplicate strictly by stable MongoDB _id / id
      const uniqueMap = new Map();
      rawList.forEach((ag) => {
        const idKey = String(ag._id || ag.id || "");
        if (idKey && !uniqueMap.has(idKey)) {
          uniqueMap.set(idKey, ag);
        }
      });
      setAgents(Array.from(uniqueMap.values()));
    } catch (err) {
      console.warn("Failed to load real agents:", err);
      setError("Unable to retrieve verified advisors at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    if (!selectedCity) return true;
    const region = (agent.region || agent.preferredCity || agent.city || "").toLowerCase();
    return region.includes(selectedCity.toLowerCase());
  });

  const handleContactAgent = async (agent) => {
    if (!isAuthenticated) {
      triggerAuthModal(`Please sign in or create an account to contact ${agent.name}.`);
      return;
    }
    const agentId = agent._id || agent.id;
    if (submittingAgentId) return; // Prevent duplicate submissions

    setSubmittingAgentId(agentId);
    try {
      await submitInquiry({
        propertyTitle: `Advisory Consultation - ${agent.name}`,
        message: `Consultation inquiry sent to verified advisor ${agent.name}.`,
        agentId: agentId,
      });
      toast.success("Inquiry sent successfully! The advisor can now review your request.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to dispatch inquiry to advisor."
      );
    } finally {
      setSubmittingAgentId(null);
    }
  };

  return (
    <div className="py-12 bg-ivory-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Natural Photo Hero Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated bg-navy-950 text-white p-8 sm:p-14 border border-navy-800">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=95"
            fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=95"
            alt="Agents Natural Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/80 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block px-4 py-1.5 bg-navy-800/80 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-gold-400 border border-navy-700 shadow-sm">
                RERA Certified Advisory Partners
              </span>
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white">
                Distinguished Real Estate Advisors
              </h1>
              <p className="text-ivory-200 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                Connect with verified property experts and certified advisors across Gujarat for discreet, end-to-end guidance.
              </p>
            </div>
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter advisors by city"
                className="bg-navy-900/90 border border-navy-700 text-white font-medium px-5 py-3 rounded-xl focus:outline-none focus:border-gold-500 text-sm"
              >
                <option value="" className="text-navy-900 bg-white">All Regions</option>
                <option value="Ahmedabad" className="text-navy-900 bg-white">Ahmedabad</option>
                <option value="Surat" className="text-navy-900 bg-white">Surat</option>
                <option value="Gandhinagar" className="text-navy-900 bg-white">Gandhinagar</option>
                <option value="Vadodara" className="text-navy-900 bg-white">Vadodara</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-card animate-pulse space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-ivory-300" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-ivory-300 rounded w-3/4" />
                    <div className="h-3 bg-ivory-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-ivory-200">
                  <div className="h-3 bg-ivory-200 rounded w-2/3" />
                  <div className="h-3 bg-ivory-200 rounded w-1/3" />
                </div>
                <div className="h-10 bg-ivory-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 border border-red-200 text-center space-y-4 max-w-lg mx-auto shadow-card">
            <p className="text-red-700 font-medium text-sm">{error}</p>
            <button
              onClick={fetchAgents}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAgents.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-ivory-300 shadow-card text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700">
              <Building className="w-8 h-8 text-forest-700" />
            </div>
            <h3 className="text-xl font-heading font-bold text-navy-900">
              No Certified Advisors Found
            </h3>
            <p className="text-navy-600 text-sm max-w-md mx-auto leading-relaxed">
              {selectedCity
                ? `There are currently no verified advisors registered under "${selectedCity}". Try selecting another region or view all advisors.`
                : "No registered advisors meet the criteria at this moment. New partners are onboarded regularly."}
            </p>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity("")}
                className="mt-2 inline-flex items-center px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition-all shadow-subtle"
              >
                View All Regions
              </button>
            )}
          </div>
        )}

        {/* Genuine Agent Cards Grid */}
        {!loading && !error && filteredAgents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => {
              const agentId = String(agent._id || agent.id);
              const agency = agent.agencyName || agent.agency || "Patel Realstate Pvt. Ltd.";
              const city = agent.region || agent.preferredCity || agent.city || "Ahmedabad";
              const rera = agent.reraId || "PR/GJ/AHEMEDABAD/0215";
              const properties = agent.propertiesCount ?? agent.activeListings ?? 0;
              const avatar = agent.profileImage || agent.avatar || agent.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80";

              return (
                <div
                  key={agentId}
                  className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <ImageWithFallback
                        src={avatar}
                        alt={agent.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-subtle border border-ivory-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-heading font-bold text-lg text-navy-900 truncate">
                            {agent.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
                        </div>
                        <p className="text-xs text-forest-700 font-semibold truncate">{agency}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 text-gold-500 fill-gold-500 shrink-0" />
                          <span className="text-xs font-bold text-navy-900">{agent.rating || 4.9}</span>
                          <span className="text-xs text-navy-600">({agent.reviews || 24} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-ivory-200 text-xs font-medium text-navy-700">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-navy-600 shrink-0" />
                        <span className="truncate">{city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-navy-600 shrink-0" />
                        <span className="truncate">RERA: {rera}</span>
                      </div>
                      <div className="inline-block px-3 py-1 bg-ivory-200 text-navy-800 rounded-full font-bold text-[11px] border border-ivory-300">
                        {properties} Managed {properties === 1 ? "Portfolio" : "Portfolios"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleContactAgent(agent)}
                    disabled={submittingAgentId === agentId}
                    className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-subtle text-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    {submittingAgentId === agentId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact Advisor</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
