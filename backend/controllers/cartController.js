const Cart = require("../models/Cart");
const Listing = require("../models/Listing");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { listingId, quantity = 1 } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find((item) =>
      item.listing.equals(listingId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        listing: listingId,
        quantity,
        price: listing.price,
      });
    }

    await cart.save();

    const populatedCart = await cart.populate("items.listing");

    res.status(200).json({
      message: "Added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Add to cart failed", error });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { listingId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => !item.listing.equals(listingId));

    await cart.save();

    const populatedCart = await cart.populate("items.listing");

    res.status(200).json({
      message: "Item removed successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Remove from cart failed", error });
  }
};

exports.getCartByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    const cart = await Cart.findOne({ user: userId }).populate("items.listing");

    if (!cart) {
      return res.status(200).json({
        message: "No cart found for this user",
        cart: { items: [], totalPrice: 0 },
      });
    }

    res.status(200).json({
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Get cart failed", error });
  }
};
