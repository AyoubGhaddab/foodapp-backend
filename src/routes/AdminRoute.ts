import express, { Request, Response, NextFunction } from "express";
import {
  CreateVandor,
  GetTransactionById,
  GetTransactions,
  GetVandorById,
  GetVandors,
} from "../controllers/";

const router = express.Router();
router.post("/vandor", CreateVandor);
router.get("/vandor", GetVandors);
router.get("/vandor/:id", GetVandorById);

router.get("/transactions", GetTransactions);
router.get("/transaction/:id", GetTransactionById);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Admin Route" });
});

export { router as AdminRoute };
