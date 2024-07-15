import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import authMiddleWare from "../middleware/auth.js";

export const orderRouter = express.Router();

orderRouter.post("/place", authMiddleWare, placeOrder);
