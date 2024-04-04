import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import bcrypt from "bcrypt";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFootInputs } from "../dto/Food.dto";
import { Food } from "../models/Food";
export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;
  if (!email || !password)
    return res.json({ message: "Login credentials not valid" });
  try {
    const existingVandor = await FindVandor("", email);
    if (existingVandor !== null) {
      // validation
      const validation = await ValidatePassword(
        password,
        existingVandor.password,
        existingVandor.salt
      );
      if (validation) {
        const signature = await GenerateSignature({
          _id: existingVandor.id,
          email: existingVandor.email,
          foodTypes: existingVandor.foodType,
          name: existingVandor.name,
        });
        console.log({ signature: signature });
        return res.json(signature);
      } else {
        return res.json({ message: "Login credentials not valid" });
      }
    }

    return res.json({ message: "Login credentials not valid" });
  } catch (e) {
    res.status(501).json({ message: "Internal error accured" });
  }
};
export const GetVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    return res.json(existingVandor);
  }
  return res.json({ message: "Vandor information not found" });
};
export const UpdateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { foodTypes, name, phone, address, serviceAvailble } = <
    EditVandorInputs
  >req.body;
  try {
    const user = req.user;
    if (user) {
      const existingVandor = await FindVandor(user._id);
      if (existingVandor !== null) {
        existingVandor.name = name;
        existingVandor.address = address;
        existingVandor.phone = phone;
        existingVandor.foodType = foodTypes;
        existingVandor.serviceAvailble = serviceAvailble;

        const savedResult = await existingVandor.save();
        return res.json(savedResult);
      }
    }
    return res.json({ message: "Vandor information not found" });
  } catch (error) {
    console.log(error);
    res.json({ message: "Internal server error" });
  }
};

export const UpdateVandorCoverPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (user) {
      const vandor = await FindVandor(user._id);
      if (vandor !== null) {
        const files = req.files as [Express.Multer.File];
        const images = files.map((file: Express.Multer.File) => file.filename);

        vandor.coverImages.push(...images);
        const result = await vandor.save();
        return res.json(result);
      }
    }
    return res.json({ message: "Food information not found" });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
};

export const UpdateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (user) {
      const existingVandor = await FindVandor(user._id);
      if (existingVandor !== null) {
        existingVandor.serviceAvailble = !existingVandor.serviceAvailble;
        const savedResult = await existingVandor.save();
        return res.json(savedResult);
      }
    }
    return res.json({ message: "Vandor information not found" });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (user) {
      const { name, description, category, foodType, readyTime, price } = <
        CreateFootInputs
      >req.body;
      const vandor = await FindVandor(user._id);
      if (vandor !== null) {
        const files = req.files as [Express.Multer.File];
        const images = files.map((file: Express.Multer.File) => file.filename);

        const createdFood = await Food.create({
          vandorId: vandor._id,
          name: name,
          description: description,
          category: category,
          foodType: foodType,
          readyTime: readyTime,
          price: price,
          images: images,
          rating: 0,
        });
        vandor.foods.push(createdFood);
        const result = await vandor.save();
        return res.json(result);
      }
    }
    return res.json({ message: "Food information not found" });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
};
export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (user) {
      const foods = await Food.find({ vandorId: user._id });
      if (foods != null) {
        return res.json(foods);
      }
    }
    return res.json({ message: "Food information not found" });
  } catch (error) {
    res.json({ message: "Internal server error" });
  }
};
