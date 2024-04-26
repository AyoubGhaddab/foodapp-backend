import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItem,
  CreateCustomerInputs,
  EditCustomerProfileInput,
  OrderInputs,
  UserLoginInput,
} from "../dto";

import { validate } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOTP,
  ValidatePassword,
} from "../utility";
import {
  Customer,
  DeliveryUser,
  Food,
  Offer,
  Order,
  Transaction,
  Vandor,
} from "../models";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);
    const inputsErrors = await validate(customerInputs, {
      validationError: { target: true },
    });
    if (inputsErrors.length > 0) {
      return res.status(400).json(inputsErrors);
    }

    const { email, phone, password } = customerInputs;
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    const existCustomer = await Customer.findOne({ email: email });
    if (existCustomer !== null) {
      return res
        .status(409)
        .json({ message: "User exist with the provided email ID" });
    }

    const result = await Customer.create({
      email: email,
      password: userPassword,
      phone: phone,
      otp: otp,
      otp_expiry: expiry,
      salt: salt,
      firstName: "",
      lastName: "",
      address: "",
      verified: false,
      lat: 0,
      lng: 0,
      orders: [],
    });
    if (result) {
      // send the OTP to customer
      //await onRequestOTP(otp, phone);
      // generate signature
      const signature = await GenerateSignature({
        _id: result._id,
        email: result.email,
        verified: result.verified,
      });
      // send the result to client
      return res.status(201).json({
        signature: signature,
        verified: result.verified,
        email: result.email,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Error with Signup " });
  }
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInput, req.body);
  const inputsErrors = await validate(loginInputs, {
    validationError: { target: true },
  });
  if (inputsErrors.length > 0) {
    return res.status(400).json(inputsErrors);
  }
  const { email, password } = loginInputs;
  const customer = await Customer.findOne({ email: email });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation) {
      const signature = await GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });
      return res.status(201).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }
  return res.status(400).json({ message: "Error with Login " });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;

  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedResponse = await profile.save();
        const signature = await GenerateSignature({
          _id: updatedResponse._id,
          email: updatedResponse.email,
          verified: updatedResponse.verified,
        });
        return res.status(201).json({
          signature: signature,
          verified: updatedResponse.verified,
          email: updatedResponse.email,
        });
      }
    }
  }

  return res.status(400).json({ message: "Error accured with OTP Validation" });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, expiry } = GenerateOtp();
      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      const sendCode = await onRequestOTP(otp, profile.phone);

      if (!sendCode) {
        return res
          .status(400)
          .json({ message: "Failed to verify your phone number" });
      }

      return res
        .status(200)
        .json({ message: "OTP sent to your registered Mobile Number!" });
    }
  }

  return res.status(400).json({ msg: "Error with Requesting OTP" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(201).json(profile);
    }
  }
  return res.status(400).json({ msg: "Error while Fetching Profile" });
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { firstName, lastName, address } = customerInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      const result = await profile.save();

      return res.status(201).json(result);
    }
  }
  return res.status(400).json({ msg: "Error while Updating Profile" });
};
export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const { amount, paymentMode, offerId } = req.body;
  let payableAmount = Number(amount);
  // check if offer exist and active
  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);
    if (appliedOffer) {
      if (
        appliedOffer.isActive &&
        payableAmount - appliedOffer.offerAmount > 0
      ) {
        payableAmount = payableAmount - appliedOffer.offerAmount;
      }
    }
  }
  // perform payment gatway charge api calls
  // right after payment gatway success / failure reponse
  // create record on transaction
  const transaction = await Transaction.create({
    customer: customer._id,
    vendorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN",
    paymentMode: paymentMode,
    paymentResponse: "Payment is Cash on Delivery",
  });

  return res.status(200).json(transaction);

  // return transaction id
  //return res.status(400).json({ message: "Offer is not valid" });
};
/* ------------------------------- Order Section -----------------------------------*/
const validateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);
  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() !== "failed") {
      return { status: true, currentTransaction };
    }
  }
  return { status: false };
};

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // grab current login customer
  const customer = req.user;

  const { txnId, amount, items } = <OrderInputs>req.body;

  // create an order ID
  if (customer) {
    const { status, currentTransaction } = await validateTransaction(txnId);
    if (!status) {
      return res.status(404).json({ message: "Error with create Order!" });
    }

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
    const profile = await Customer.findById(customer._id);
    // Grab order items from requestr

    const cart = <[CartItem]>req.body;
    const cartItems = Array();
    let netAmount = 0.0;
    let vandorId: string;
    // calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();
    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          vandorId = food.vandorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });
    // create order with item descriptions
    if (cartItems) {
      const currentOrder = await Order.create({
        orderId: orderId,
        items: cartItems,
        vandorId: vandorId,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 30,
      });
      // finaly update orders to user account
      if (currentOrder) {
        profile.cart = [] as any;
        profile.orders.push(currentOrder);

        // update transaction
        currentTransaction.vendorId = vandorId;
        currentTransaction.orderId = orderId;
        currentTransaction.status = "CONFIRMED";
        assignOrderForDelivery(currentOrder._id, vandorId);
        await currentTransaction.save();

        await profile.save();
        return res.status(200).json(currentOrder);
      }
    }
  }

  return res.status(400).json({ message: "Error with Create order" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  // create an order ID
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");
    if (profile) {
      return res.status(200).json(profile.orders);
    }
    // Grab order items from requestr
  }
  return res.status(400).json({ message: "Error with Get order" });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const { id } = req.params;
  // create an order ID
  if (customer && id) {
    const order = await Order.findById(id).populate("items.food");
    return res.status(200).json(order);

    // Grab order items from requestr
  }
  return res.status(400).json({ message: "Error with Get order" });
};

/* ------------------------------- CART functions -----------------------------------*/

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    let cartItems = Array();

    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          // check and update
          let existFoodItems = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );
          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);

            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new Item
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }

  return res.status(404).json({ msg: "Unable to add to cart!" });
};
export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }

  return res.status(400).json({ message: "Cart is Empty!" });
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id)
      .populate("cart.food")
      .exec();

    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();

      return res.status(200).json(cartResult);
    }
  }

  return res.status(400).json({ message: "cart is Already Empty!" });
};
export const ApplyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const { id } = req.params;
  if (customer) {
    const appliedOffer = await Offer.findById(id);
    if (appliedOffer) {
      if (appliedOffer.promoType === "USER") {
        // only can apply once per user
      } else {
        if (appliedOffer.isActive) {
          return res
            .status(200)
            .json({ message: "Offer is Valid", offer: appliedOffer });
        }
      }
    }
  }

  return res.status(400).json({ message: "Offer is not valid" });
};
/* ------------------------------- Delivery Notifications -----------------------------------*/

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
  const vendor = await Vandor.findById(vendorId);
  if (vendor) {
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    //find the available Delivery person
    const deliveryPerson = await DeliveryUser.find({
      pincode: areaCode,
      verified: true,
      isAvailable: true,
    });
    if (deliveryPerson) {
      // Check the nearest delivery person and assign the order

      const currentOrder = await Order.findById(orderId);
      if (currentOrder) {
        //update Delivery ID
        currentOrder.deliveryId = deliveryPerson[0]._id;
        await currentOrder.save();

        //Notify to vendor for received new order firebase push notification
      }
    }
  }

  // Update Delivery ID
};
