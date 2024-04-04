import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  EditCustomerProfileInput,
  UserLoginInput,
} from "../dto/Customer.dto";

import { validate } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOTP,
  ValidatePassword,
} from "../utility";
import { Customer } from "../models";

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
