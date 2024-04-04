import bcrypt from "bcrypt";
import jwt, { sign } from "jsonwebtoken";
import { VandorPayload, AuthPayload } from "../dto";
import { Request } from "express";
import { JWT_SECRET } from "../config";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  entredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(entredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: AuthPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get("Authorization");
  if (signature) {
    const payload = (await jwt.verify(
      signature.split(" ")[1],
      JWT_SECRET
    )) as AuthPayload;
    req.user = payload;
    return true;
  }

  return false;
};
