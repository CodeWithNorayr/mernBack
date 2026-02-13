import express from "express";
import { fetchingMyOrders, placeOrder, verifyOrder } from "../controllers/placeOrderController.js";
import protectUser from "../middlewares/userMiddleware.js";

const orderRouter = express.Router();

// ✅ PLACE ORDER
orderRouter.post("/place", protectUser, placeOrder);
orderRouter.post('/verify', protectUser, verifyOrder);
orderRouter.get("/my-orders", protectUser, fetchingMyOrders);

export default orderRouter;
