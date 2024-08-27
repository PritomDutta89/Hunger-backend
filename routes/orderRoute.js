import express from "express";
import {
  listOrders,
  payIntegration,
  placeOrder,
  redirectUrl,
  updateStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import authMiddleWare from "../middleware/auth.js";

export const orderRouter = express.Router();

orderRouter.post("/place", authMiddleWare, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.get("/redirect-url/:merchantTransactionId/:userId", redirectUrl);
orderRouter.post("/userorders", authMiddleWare, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

// phone pay integration
orderRouter.get("/pay", payIntegration);
