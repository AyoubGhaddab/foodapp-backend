import express, { Request, Response, NextFunction } from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  RequestOtp,
} from "../controllers/";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Admin Route" });
});

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

/* ------------------------- Order Section -------------------------- */

/* ------------------------- Payment Section -------------------------- */

export { router as CustomerRoute };
