import express from "express";
import {
  payIntegration,
  placeOrder,
  redirectUrl,
  useOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import authMiddleWare from "../middleware/auth.js";

export const orderRouter = express.Router();

orderRouter.post("/place", authMiddleWare, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.get("/redirect-url/:merchantTransactionId/:userId", redirectUrl);
orderRouter.post("/userorders", authMiddleWare, useOrders);

// phone pay integration
orderRouter.get("/pay", payIntegration);
