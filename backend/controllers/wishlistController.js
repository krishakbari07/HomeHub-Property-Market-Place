import Wishlist from "../models/Wishlist.js";

// @desc    Get current user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("properties");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, properties: [] });
    }
    return res.json(wishlist.properties);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle property in user wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, properties: [propertyId] });
    } else {
      const existsIndex = wishlist.properties.findIndex(
        (id) => id.toString() === propertyId.toString()
      );
      if (existsIndex >= 0) {
        wishlist.properties.splice(existsIndex, 1);
      } else {
        wishlist.properties.push(propertyId);
      }
    }

    await wishlist.save();
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate("properties");
    return res.json(updatedWishlist.properties);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
