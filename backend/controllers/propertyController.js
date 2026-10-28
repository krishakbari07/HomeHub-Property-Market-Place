import Property from "../models/Property.js";
import User from "../models/User.js";

// Helper function to format property price
const formatPriceHelper = (price, purpose) => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return "₹ 0";
  if (purpose && purpose.toLowerCase() === "rent") {
    return `₹ ${numPrice.toLocaleString("en-IN")} /mo`;
  }
  if (numPrice >= 10000000) {
    return `₹ ${(numPrice / 10000000).toFixed(2)} Cr`;
  } else if (numPrice >= 100000) {
    return `₹ ${(numPrice / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${numPrice.toLocaleString("en-IN")}`;
};

// Helper for property response formatting
const formatPropertyResponse = (p) => {
  const doc = p.toObject ? p.toObject() : p;
  return {
    ...doc,
    _id: doc._id,
    id: doc._id.toString(),
    type: doc.type || doc.propertyType || "Apartment",
    propertyType: doc.propertyType || doc.type || "Apartment",
    purpose: doc.purpose || doc.listingType || "buy",
    listingType: doc.listingType || doc.purpose || "buy",
    formattedPrice: doc.formattedPrice || formatPriceHelper(doc.price, doc.purpose),
  };
};

// @desc    Get all properties with filtering & search
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const {
      purpose,
      listingType,
      city,
      location,
      type,
      propertyType,
      bedrooms,
      minPrice,
      maxPrice,
      search,
      furnishing,
      sortBy,
    } = req.query;

    const conditions = [];

    // 1. Purpose Filter
    const targetPurpose = (purpose || listingType || "").toLowerCase();
    if (targetPurpose && targetPurpose !== "all") {
      if (["buy", "sale", "sell", "for sale"].includes(targetPurpose)) {
        conditions.push({
          $and: [
            {
              $or: [
                { purpose: { $in: ["buy", "sale", "sell", "Buy", "Sale", "Sell", "For Sale", "for sale"] } },
                { listingType: { $in: ["buy", "sale", "sell", "Buy", "Sale", "Sell", "For Sale", "for sale"] } },
                { tag: { $regex: /sale/i } },
              ],
            },
            {
              purpose: { $nin: ["rent", "Rent", "rental", "Rental", "For Rent", "for rent"] },
            },
          ],
        });
      } else if (["rent", "rental", "for rent"].includes(targetPurpose)) {
        conditions.push({
          $or: [
            { purpose: { $in: ["rent", "Rent", "rental", "Rental", "For Rent", "for rent"] } },
            { listingType: { $in: ["rent", "Rent", "rental", "Rental", "For Rent", "for rent"] } },
            { tag: { $regex: /rent/i } },
          ],
        });
      } else {
        conditions.push({
          purpose: { $regex: new RegExp(`^${targetPurpose}$`, "i") },
        });
      }
    }

    // 2. City & Location Filter
    if (city && city.toLowerCase() !== "all" && city.toLowerCase() !== "all cities") {
      conditions.push({
        $or: [
          { city: { $regex: new RegExp(city, "i") } },
          { location: { $regex: new RegExp(city, "i") } },
        ],
      });
    }

    if (
      location &&
      location.toLowerCase() !== "all" &&
      location.toLowerCase() !== "all locations" &&
      (!city || city.toLowerCase() === "all" || city.toLowerCase() === "all cities")
    ) {
      conditions.push({
        $or: [
          { location: { $regex: new RegExp(location, "i") } },
          { city: { $regex: new RegExp(location, "i") } },
          { address: { $regex: new RegExp(location, "i") } },
        ],
      });
    }

    // 3. Property Type Filter
    const targetType = type || propertyType;
    if (targetType && targetType.toLowerCase() !== "all" && targetType.toLowerCase() !== "all types") {
      conditions.push({
        $or: [
          { type: { $regex: new RegExp(`^${targetType}$`, "i") } },
          { propertyType: { $regex: new RegExp(`^${targetType}$`, "i") } },
        ],
      });
    }

    // 4. Bedrooms Filter
    if (bedrooms && bedrooms !== "All" && bedrooms !== "Any") {
      const bNum = parseInt(bedrooms, 10);
      if (!isNaN(bNum)) {
        conditions.push({ bedrooms: { $gte: bNum } });
      }
    }

    // 5. Min / Max Price Filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) {
        const minP = parseFloat(minPrice);
        if (!isNaN(minP)) priceFilter.$gte = minP;
      }
      if (maxPrice) {
        const maxP = parseFloat(maxPrice);
        if (!isNaN(maxP)) priceFilter.$lte = maxP;
      }
      if (Object.keys(priceFilter).length > 0) {
        conditions.push({ price: priceFilter });
      }
    }

    // 6. Furnishing Filter
    if (furnishing && furnishing.toLowerCase() !== "all") {
      conditions.push({
        furnishing: { $regex: new RegExp(furnishing, "i") },
      });
    }

    // 7. General Keyword Search (searches title, location, city, address, type, description)
    if (search && search.trim()) {
      const s = search.trim();
      conditions.push({
        $or: [
          { title: { $regex: s, $options: "i" } },
          { location: { $regex: s, $options: "i" } },
          { city: { $regex: s, $options: "i" } },
          { address: { $regex: s, $options: "i" } },
          { type: { $regex: s, $options: "i" } },
          { propertyType: { $regex: s, $options: "i" } },
          { description: { $regex: s, $options: "i" } },
        ],
      });
    }

    // Construct final MongoDB query
    let query = {};
    if (conditions.length === 1) {
      query = conditions[0];
    } else if (conditions.length > 1) {
      query = { $and: conditions };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === "price-low") {
      sortOptions = { price: 1 };
    } else if (sortBy === "price-high") {
      sortOptions = { price: -1 };
    } else if (sortBy === "ai-score") {
      sortOptions = { aiMatchScore: -1, createdAt: -1 };
    }

    const properties = await Property.find(query)
      .populate("owner", "name email role phone avatar profileImage")
      .populate("agent", "name email role phone avatar profileImage agencyName reraId")
      .sort(sortOptions);

    const formatted = properties.map(formatPropertyResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      properties: formatted, // top level array compatibility
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get listings by current logged-in user (Seller / Agent)
// @route   GET /api/properties/my-properties OR /api/properties/my-listings
// @access  Private
export const getMyProperties = async (req, res) => {
  try {
    const isAgent = req.user?.role?.toLowerCase() === "agent";
    const filterQuery = isAgent
      ? { $or: [{ owner: req.user._id }, { agent: req.user._id }] }
      : { owner: req.user._id };

    const properties = await Property.find(filterQuery)
      .populate("owner", "name email role phone avatar profileImage")
      .populate("agent", "name email role phone avatar profileImage agencyName reraId")
      .sort({ createdAt: -1 });
    const formatted = properties.map(formatPropertyResponse);

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      properties: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email role phone avatar profileImage")
      .populate("agent", "name email role phone avatar profileImage agencyName reraId");
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    const formatted = formatPropertyResponse(property);
    return res.json({
      success: true,
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Admin only)
export const createProperty = async (req, res) => {
  try {
    // 1. Authorize: Admin, Seller, and Agent roles can create property listings
    const userRole = (req.user?.role || "").toLowerCase();
    if (!["admin", "seller", "agent"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only administrators, sellers, and agents can add property listings.",
      });
    }

    const {
      title,
      description,
      price,
      purpose,
      listingType,
      type,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      areaSqFt,
      furnishing,
      location,
      address,
      city,
      state,
      pincode,
      image,
      images,
      amenities,
      features,
      tag,
      badgeText,
      status,
      agent,
      agentId,
      isFeatured,
      aiMatchScore,
    } = req.body;

    // 2. Validate required text fields
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Property title is required.",
      });
    }

    if (price === undefined || price === null || String(price).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Property price is required.",
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Property price must be a valid positive number.",
      });
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Property location is required.",
      });
    }

    // 3. Validate numeric fields
    let numBedrooms = 3;
    if (bedrooms !== undefined && bedrooms !== null && String(bedrooms).trim() !== "") {
      numBedrooms = Number(bedrooms);
      if (isNaN(numBedrooms) || numBedrooms < 0) {
        return res.status(400).json({
          success: false,
          message: "Bedrooms must be a valid non-negative number.",
        });
      }
    }

    let numBathrooms = 2;
    if (bathrooms !== undefined && bathrooms !== null && String(bathrooms).trim() !== "") {
      numBathrooms = Number(bathrooms);
      if (isNaN(numBathrooms) || numBathrooms < 0) {
        return res.status(400).json({
          success: false,
          message: "Bathrooms must be a valid non-negative number.",
        });
      }
    }

    let numArea = 1500;
    const rawArea = area !== undefined && area !== null && String(area).trim() !== "" ? area : areaSqFt;
    if (rawArea !== undefined && rawArea !== null && String(rawArea).trim() !== "") {
      numArea = Number(rawArea);
      if (isNaN(numArea) || numArea <= 0) {
        return res.status(400).json({
          success: false,
          message: "Property area must be a valid positive number.",
        });
      }
    }

    // 4. Resolve purpose & listing type
    const rawPurpose = (purpose || listingType || "buy").toLowerCase();
    const resolvedPurpose = ["rent", "rental", "for rent"].includes(rawPurpose) ? "rent" : "buy";
    const resolvedType = type || propertyType || "Apartment";
    const resolvedCity = city && typeof city === "string" && city.trim() ? city.trim() : "Ahmedabad";

    // 5. Resolve availability status
    let resolvedStatus = "Available";
    if (status) {
      const s = String(status).toLowerCase();
      if (s === "sold") resolvedStatus = "Sold";
      else if (s === "rented") resolvedStatus = "Rented";
      else resolvedStatus = "Available";
    }

    // 6. Resolve images
    const fallbackImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";
    let resolvedImage = image;
    let resolvedImages = Array.isArray(images) ? images : [];
    if (!resolvedImage && resolvedImages.length > 0) {
      resolvedImage = resolvedImages[0];
    }
    if (!resolvedImage) {
      resolvedImage = fallbackImage;
    }
    if (resolvedImages.length === 0) {
      resolvedImages = [resolvedImage];
    }

    // 7. Resolve assigned agent based on listing creator role
    let resolvedAgent = null;
    if (userRole === "agent") {
      // The creating agent is the dedicated manager of their own listing
      resolvedAgent = req.user._id;
    } else if (agent || agentId) {
      // For Admin or Seller listings: only assign an agent if explicitly chosen
      const explicitAgentId = agent || agentId;
      const targetAgent = await User.findById(explicitAgentId);
      if (targetAgent && targetAgent.role?.toLowerCase() === "agent") {
        resolvedAgent = targetAgent._id;
      }
    }

    const newProperty = new Property({
      title: title.trim(),
      description: description || "Spacious, premium property situated in prime location.",
      price: numPrice,
      formattedPrice: formatPriceHelper(numPrice, resolvedPurpose),
      purpose: resolvedPurpose,
      listingType: resolvedPurpose,
      type: resolvedType,
      propertyType: resolvedType,
      bedrooms: numBedrooms,
      bathrooms: numBathrooms,
      area: numArea,
      areaSqFt: numArea,
      furnishing: furnishing || "Fully Furnished",
      location: location.trim(),
      address: address || location.trim(),
      city: resolvedCity,
      state: state || "Gujarat",
      pincode: pincode || "",
      image: resolvedImage,
      images: resolvedImages,
      amenities: Array.isArray(amenities) ? amenities : [],
      features: Array.isArray(features) ? features : [],
      tag: tag || (resolvedPurpose === "rent" ? "For Rent" : "For Sale"),
      badgeText: badgeText || "New Listing",
      status: resolvedStatus,
      isFeatured: Boolean(isFeatured),
      aiMatchScore: Number(aiMatchScore) || 92,
      owner: req.user._id,
      ownerName: req.user.name || "HomeHub Partner",
      ownerRole: userRole,
      createdBy: req.user._id,
      creatorRole: userRole,
      sellerName: req.user.name || "HomeHub Partner",
      agent: resolvedAgent,
      needsManualReview: false,
    });

    const savedProperty = await newProperty.save();
    const populated = await Property.findById(savedProperty._id)
      .populate("owner", "name email role phone avatar profileImage")
      .populate("agent", "name email role phone avatar profileImage agencyName reraId");
    const formatted = formatPropertyResponse(populated);

    return res.status(201).json({
      success: true,
      message: "Property created successfully in MongoDB Atlas",
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    console.error("Create property error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create property listing",
    });
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner or Admin)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Ownership validation (Owner, Assigned Agent, or Admin)
    const isOwner = Boolean(property.owner && property.owner.toString() === req.user._id.toString());
    const isAssignedAgent = Boolean(property.agent && property.agent.toString() === req.user._id.toString());
    const isAdmin = Boolean(req.user.role && req.user.role.toLowerCase() === "admin");

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this property listing.",
      });
    }

    const {
      title,
      description,
      price,
      purpose,
      listingType,
      type,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      areaSqFt,
      furnishing,
      location,
      address,
      city,
      state,
      pincode,
      image,
      images,
      status,
      features,
      amenities,
      agent,
      agentId,
    } = req.body;

    if (title) property.title = title.trim();
    if (description) property.description = description;
    if (price !== undefined) {
      property.price = Number(price);
      property.formattedPrice = formatPriceHelper(price, purpose || property.purpose);
    }
    if (purpose || listingType) {
      const pVal = (purpose || listingType).toLowerCase();
      property.purpose = pVal;
      property.listingType = pVal;
    }
    if (type || propertyType) {
      const tVal = type || propertyType;
      property.type = tVal;
      property.propertyType = tVal;
    }
    if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) property.bathrooms = Number(bathrooms);
    if (area !== undefined || areaSqFt !== undefined) {
      const aVal = Number(area || areaSqFt);
      property.area = aVal;
      property.areaSqFt = aVal;
    }
    if (furnishing) property.furnishing = furnishing;
    if (location) property.location = location.trim();
    if (address) property.address = address;
    if (city) property.city = city;
    if (state) property.state = state;
    if (pincode) property.pincode = pincode;
    if (image) property.image = image;
    if (Array.isArray(images)) property.images = images;
    if (Array.isArray(features)) property.features = features;
    if (Array.isArray(amenities)) property.amenities = amenities;
    if (status) property.status = status;

    if (agent !== undefined || agentId !== undefined) {
      const targetAgentId = agent || agentId;
      if (targetAgentId) {
        property.agent = targetAgentId;
      }
    }

    const updatedProperty = await property.save();
    const populated = await Property.findById(updatedProperty._id)
      .populate("owner", "name email role phone avatar profileImage")
      .populate("agent", "name email role phone avatar profileImage agencyName reraId");
    const formatted = formatPropertyResponse(populated);

    return res.json({
      success: true,
      message: "Property updated successfully in MongoDB Atlas",
      data: formatted,
      ...formatted,
    });
  } catch (error) {
    console.error("Update property error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner or Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Ownership validation (Owner or Admin)
    const isOwner = Boolean(property.owner && property.owner.toString() === req.user._id.toString());
    const isAdmin = Boolean(req.user.role && req.user.role.toLowerCase() === "admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this property listing.",
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Property deleted successfully from MongoDB Atlas",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Delete property error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
