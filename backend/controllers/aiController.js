import Property from "../models/Property.js";
import {
  chatWithPropertiesRAG,
  parseNaturalLanguageSearch,
  getPersonalizedRecommendations,
  generateListingDescription,
  estimatePropertyValuation,
} from "../services/geminiService.js";

// @desc    Feature 1: AI Chatbot answering using Real HomeHub Listings (RAG)
// @route   POST /api/ai/chat
// @access  Public
export const aiChat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "A user message is required" });
    }

    const result = await chatWithPropertiesRAG({
      message: message.trim(),
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
    });

    return res.json({
      success: result.success !== false,
      reply: result.reply,
      model: result.model,
      verifiedPropertiesContextCount: result.propertiesCount,
      source: result.success !== false ? "gemini_rag" : "service_notice",
    });
  } catch (error) {
    console.error("AI Chatbot Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      reply: "The AI property assistant is temporarily unavailable. Please explore our verified catalog directly.",
      error: error.message,
    });
  }
};

// @desc    Feature 2: Natural-Language Smart Property Search
// @route   POST /api/ai/smart-search
// @access  Public
export const aiSmartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const parsedFilters = await parseNaturalLanguageSearch(query.trim());

    // Build verified MongoDB query
    const conditions = [{ status: "Available" }];

    // Purpose filter
    if (parsedFilters.purpose) {
      const p = parsedFilters.purpose.toLowerCase();
      if (p === "rent") {
        conditions.push({
          $or: [{ purpose: /rent/i }, { listingType: /rent/i }, { tag: /rent/i }],
        });
      } else if (p === "buy") {
        conditions.push({
          $or: [{ purpose: /buy|sale|sell/i }, { listingType: /buy|sale|sell/i }, { tag: /sale/i }],
          purpose: { $nin: ["rent", "Rent", "Rental", "rental", "For Rent"] },
        });
      }
    }

    // Location / City filter
    if (parsedFilters.location) {
      conditions.push({
        $or: [
          { location: new RegExp(parsedFilters.location, "i") },
          { city: new RegExp(parsedFilters.location, "i") },
        ],
      });
    }

    // Property Type filter
    if (parsedFilters.type) {
      conditions.push({
        $or: [
          { type: new RegExp(parsedFilters.type, "i") },
          { propertyType: new RegExp(parsedFilters.type, "i") },
        ],
      });
    }

    // Bedrooms filter
    if (parsedFilters.bedrooms && Number(parsedFilters.bedrooms) > 0) {
      conditions.push({ bedrooms: { $gte: Number(parsedFilters.bedrooms) } });
    }

    // Min Price filter
    if (parsedFilters.minPrice && Number(parsedFilters.minPrice) > 0) {
      conditions.push({ price: { $gte: Number(parsedFilters.minPrice) } });
    }

    // Max Price filter
    if (parsedFilters.maxPrice && Number(parsedFilters.maxPrice) > 0) {
      conditions.push({ price: { $lte: Number(parsedFilters.maxPrice) } });
    }

    const finalQuery = conditions.length > 0 ? { $and: conditions } : {};
    const matchingProperties = await Property.find(finalQuery).limit(12).lean();

    return res.json({
      success: true,
      parsedFilters,
      count: matchingProperties.length,
      properties: matchingProperties,
      clarificationNeeded: Boolean(parsedFilters.isAmbiguous),
      clarificationMessage: parsedFilters.clarificationMessage || null,
    });
  } catch (error) {
    console.error("Smart Search Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to execute smart search query against verified catalog.",
      error: error.message,
    });
  }
};

// @desc    Feature 3: Personalized Property Recommendations with Rationale
// @route   POST /api/ai/recommendations
// @access  Public
export const getAiRecommendations = async (req, res) => {
  try {
    const { purpose, location, type, bedrooms, maxBudget, preferences } = req.body;

    const result = await getPersonalizedRecommendations({
      preferences: Array.isArray(preferences) ? preferences : [],
      preferredCity: location,
      maxBudget,
      propertyType: type,
      purpose,
      bedrooms,
    });

    return res.json({
      success: true,
      count: result.recommendations.length,
      recommendations: result.recommendations,
      scoringMethod: result.scoringMethod,
    });
  } catch (error) {
    console.error("AI Recommendation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to compute personalized recommendations.",
      error: error.message,
    });
  }
};

// @desc    Feature 4: AI Listing Title and Description Generator for Authorized Sellers/Agents
// @route   POST /api/ai/generate-description
// @access  Private (Sellers, Agents, Admins)
export const generateListingAiContent = async (req, res) => {
  try {
    const { propertyType, location, city, bedrooms, bathrooms, areaSqFt, price, purpose, features, tone } = req.body;

    if (!propertyType || !location) {
      return res.status(400).json({ success: false, message: "Property type and location are required." });
    }

    const generated = await generateListingDescription({
      propertyType: propertyType || "Apartment",
      location: location || "Prime Locality",
      city: city || "Ahmedabad",
      bedrooms: Number(bedrooms) || 3,
      bathrooms: Number(bathrooms) || 2,
      areaSqFt: Number(areaSqFt) || 1600,
      price: Number(price) || 10000000,
      purpose: purpose || "buy",
      features: Array.isArray(features) ? features : [],
      tone: tone || "Luxury & Architectural",
    });

    return res.json({
      success: true,
      data: generated,
      isDraft: true,
    });
  } catch (error) {
    console.error("Listing Generation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI listing content.",
    });
  }
};

// @desc    Feature 5: Property Price Estimator using Comparable Real Market Listings
// @route   POST /api/ai/valuation
// @access  Public
export const getAiValuation = async (req, res) => {
  try {
    const { city, location, propertyType, areaSqFt, bedrooms, bathrooms, purpose } = req.body;

    const valuationResult = await estimatePropertyValuation({
      city: city || "Ahmedabad",
      location: location || city || "Bodakdev",
      propertyType: propertyType || "Apartment",
      areaSqFt: Number(areaSqFt) || 1500,
      bedrooms: Number(bedrooms) || 3,
      bathrooms: Number(bathrooms) || 2,
      purpose: purpose || "buy",
    });

    return res.json({
      success: true,
      ...valuationResult,
    });
  } catch (error) {
    console.error("AI Valuation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate valuation estimate.",
    });
  }
};
