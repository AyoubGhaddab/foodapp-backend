import express, { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";

import { GeneratePassword, GenerateSalt } from "../utility";
import { FoodDoc, Vandor } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailble: true,
    })
      .sort([["rating", "descending"]])
      .populate("foods");
    if (result.length > 0) {
      res.status(200).json(result);
    }

    return res.status(400).json({ message: "Food information not found" });
  } catch (error) {}
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailble: true,
    })
      .sort([["rating", "descending"]])
      .limit(1);

    if (result.length > 0) {
      res.status(200).json(result);
    }

    return res.status(400).json({ message: "Food information not found" });
  } catch (error) {}
};

export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailble: true,
    }).populate("foods");

    if (result.length > 0) {
      let foodResult: any = [];
      result.map((vandor) => {
        const foods = vandor.foods as [FoodDoc];
        foodResult.push(...foods.filter((food) => food.readyTime <= 30));
      });
      res.status(200).json(foodResult);
    }

    return res.status(400).json({ message: "Food information not found" });
  } catch (error) {}
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;
    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailble: true,
    }).populate("foods");

    if (result.length > 0) {
      let foodResult: any = [];
      result.map((vandor) => foodResult.push(...vandor.foods));
      res.status(200).json(foodResult);
    }

    return res.status(400).json({ message: "Food information not found" });
  } catch (error) {}
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const result = await Vandor.findById(id).populate("foods");

    if (result !== null) {
      return res.status(200).json(result);
    }

    return res.status(400).json({ message: "Food information not found" });
  } catch (error) {}
};
