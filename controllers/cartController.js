import User from "../models/User.js";

const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const user = await User.findById(req.user._id);

    const cartData = user.cartData || {};

    cartData[itemId] = (cartData[itemId] || 0) + 1;

    user.cartData = cartData;
    await user.save();

    res.json({
      success: true,
      message: "Course added to cart successfully",
      cartData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to add to cart",
    });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
       message: "Item ID is required",
      });
    }

    const user = await User.findById(req.user._id);

    const cartData = user.cartData || {};

    if (!cartData[itemId]) {
      return res.json({
        success: false,
        message: "Item not in cart",
      });
    }

    if (cartData[itemId] === 1) {
      delete cartData[itemId];
    } else {
      cartData[itemId] -= 1;
    }

    user.cartData = cartData;
    await user.save();

    res.json({
      success: true,
      message: "Course removed from cart",
      cartData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to remove from cart",
    });
  }
};


const getCartItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user.cartData || {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch cart items",
    });
  }
};


export {addToCart,removeFromCart,getCartItems}