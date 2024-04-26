import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { CreateOfferInputs, EditVandorInputs, VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import bcrypt from "bcrypt";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFootInputs } from "../dto/Food.dto";
import { Food, Offer, Order } from "../models";

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
    const { lat, lng } = req.body;
    if (user) {
      const existingVandor = await FindVandor(user._id);
      if (existingVandor !== null) {
        existingVandor.serviceAvailble = !existingVandor.serviceAvailble;
        if (lat && lng) {
          existingVandor.lat = lat;
          existingVandor.lng = lng;
        }
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

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const orders = await Order.find({ vandorId: user._id }).populate(
      "items.food"
    );

    if (orders != null) {
      return res.status(200).json(orders);
    }
  }

  return res.json({ message: "Orders Not found" });
};
export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    if (order != null) {
      return res.status(200).json(order);
    }
  }

  return res.json({ message: "Order Not found" });
};
export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  const { status, remarks, time } = req.body;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    order.orderStatus = status; // WAITING // FAILED // ACCEPT // REJECT // UNDER-PROCESS // READY // DELIVERD
    order.remarks = remarks;
    if (time) {
      order.readyTime = time;
    }

    const orderResult = await order.save();

    if (orderResult != null) {
      return res.status(200).json(orderResult);
    }
  }

  return res.json({ message: "Unable to process order" });
};

export const GetOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const offers = await Offer.find({
      $or: [{ vandors: user._id }, { offerType: "GENERIC" }],
    });

    return res.status(200).json(offers);
  }

  return res.json({ message: "Offers Not available" });
};
export const AddOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      startValidity,
      endValidity,
      promocode,
      promoType,
      bank,
      bins,
      pincode,
      isActive,
    } = <CreateOfferInputs>req.body;
    const vandor = await FindVandor(user._id);
    if (vandor) {
      const offer = await Offer.create({
        offerType,
        vandors: [vandor],
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promocode,
        promoType,
        bank,
        bins,
        pincode,
        isActive,
      });
      return res.status(200).json(offer);
    }
  }
  return res.json({ message: "Unable to Add Offer" });
};
export const EditOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const offerId = req.params.id;

  if (user) {
    const {
      title,
      description,
      offerType,
      offerAmount,
      pincode,
      promocode,
      promoType,
      startValidity,
      endValidity,
      bank,
      bins,
      minValue,
      isActive,
    } = <CreateOfferInputs>req.body;

    const currentOffer = await Offer.findById(offerId);

    if (currentOffer) {
      const vendor = await FindVandor(user._id);

      if (vendor) {
        (currentOffer.title = title),
          (currentOffer.description = description),
          (currentOffer.offerType = offerType),
          (currentOffer.offerAmount = offerAmount),
          (currentOffer.pincode = pincode),
          (currentOffer.promoType = promoType),
          (currentOffer.startValidity = startValidity),
          (currentOffer.endValidity = endValidity),
          (currentOffer.bank = bank),
          (currentOffer.isActive = isActive),
          (currentOffer.minValue = minValue);

        const result = await currentOffer.save();

        return res.status(200).json(result);
      }
    }
  }

  return res.json({ message: "Unable to add Offer!" });
};
export const DeleteOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.json({ message: "Unable to process order" });
};
