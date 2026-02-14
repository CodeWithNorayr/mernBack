import Order from "../models/Order.js";
import User from "../models/User.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrder = async (req, res) => {
  const frontend_url = "https://mernfront-ijcd.onrender.com";

  try {
    const { items, address, amount } = req.body;

    // ✅ userId must come from token middleware, NOT frontend
    const userId = req.user._id;

    // 1️⃣ Save order in DB
    const newOrder = new Order({
      userId,
      items,
      address,
      amount,
    });

    await newOrder.save();

    // 2️⃣ Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Delivery Fee
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 200 * 100,
      },
      quantity: 1,
    });

    // 3️⃣ Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",

      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // 4️⃣ Clear Cart
    await User.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.log("ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Order failed",
    });
  }
};

export const verifyOrder = async (req,res) => {
  const { success, orderId } = req.body; // keep POST from frontend
  try {
    if(success === "true"){
      await Order.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await Order.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not paid" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error verifying order" });
  }
}


export const fetchingMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Safety check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // ✅ Correct query: find orders by userId
    const orders = await Order.find({ userId }).sort({createdAt:-1});

    // ✅ If no orders
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.log("FETCH ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

