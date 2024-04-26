import express, { Request, Response, NextFunction } from "express";
import {
  AddToCart,
  ApplyOffer,
  CreateOrder,
  CreatePayment,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  EditCustomerProfile,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
} from "../controllers/";
import { Authenticate } from "../middlewares";

const router = express.Router();

/* ------------------------- Signup / Create Customer -------------------------- */
router.post("/signup", CustomerSignUp);
/* -------------------------  Login -------------------------- */
router.post("/login", CustomerLogin);

/* -------------------------  Authentication -------------------------- */
router.use(Authenticate);
/* ------------------------- Verify Customer account -------------------------- */
router.patch("/verify", CustomerVerify);
/* ------------------------- OTP / Requestion OTP -------------------------- */
router.get("/otp", RequestOtp);
/* ------------------------- Profile -------------------------- */
router.get("/profile", GetCustomerProfile);
router.patch("/profile", EditCustomerProfile);

/* ------------------------- Cart Section -------------------------- */
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);
/* ------------------------- Order Section -------------------------- */
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/orders/:id", GetOrderById);
/* ------------------------- Payment Section -------------------------- */
router.post("/create-payment", CreatePayment);
/* ------------------------- Offers -------------------------- */
router.get("/offer/verify/:id", ApplyOffer);
export { router as CustomerRoute };
