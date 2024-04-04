import express, { Request, Response, NextFunction } from "express";
import {
  GetFoodAvailability,
  GetFoodsIn30Min,
  GetTopRestaurants,
  RestaurantById,
  SearchFoods,
} from "../controllers";

const router = express.Router();

/* ------------------------------Food Availibility ----------------------------- */
router.get("/:pincode", GetFoodAvailability);

/* ------------------------------Top Restaurant ----------------------------- */
router.get("/top-restaurants/:pincode", GetTopRestaurants);

/* ------------------------------Food Availble in 30 minutes or LEss ----------------------------- */
router.get("/foods-in-30-min/:pincode", GetFoodsIn30Min);

/* ------------------------------Search Foods ----------------------------- */
router.get("/search/:pincode", SearchFoods);

/* ------------------------------Find Restaurant By ID ----------------------------- */
router.get("/restaurant/:id", RestaurantById);

export { router as ShoppingRoute };
