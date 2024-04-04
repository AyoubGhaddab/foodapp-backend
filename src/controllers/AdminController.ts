import express, { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models/Vandor";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email: email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    ownerName,
    foodType,
    pincode,
    address,
    phone,
    email,
    password,
  } = <CreateVandorInput>req.body;
  try {
    const existingVandor = await FindVandor("", email);
    if (existingVandor !== null) {
      return res.json({ message: "A vandor exist with this email ID" });
    }
    //generate salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);
    //encrypt password using the salt

    const createdVandor = await Vandor.create({
      name: name,
      ownerName: ownerName,
      foodType: foodType,
      pincode: pincode,
      address: address,
      phone: phone,
      email: email,
      password: userPassword,
      salt: salt,
      serviceAvailble: false,
      coverImages: [],
      foods: [],
      rating: 0,
    });

    return res.json(createdVandor);
  } catch (error) {
    res.status(501).json({ message: "Internal error accured" });
  }
};

export const GetVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vandors = await Vandor.find();
    return res.json(vandors);
  } catch (error) {
    res.status(501).json({ message: "Internal error accured" });
  }
};

export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vandorId = req.params.id;
    const vandor = await FindVandor(vandorId);
    if (vandor !== null) {
      return res.json(vandor);
    }
    return res.json({ message: `Vandor not found with id ${vandorId}` });
  } catch (error) {
    res
      .status(501)
      .json({ message: "Internal error accured", error: error?.message });
  }
};
