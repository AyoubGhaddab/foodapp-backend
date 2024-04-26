import express, { Application } from "express";
import {
  AdminRoute,
  VandorRoute,
  ShoppingRoute,
  CustomerRoute,
} from "../routes";
require("dotenv").config();
import path from "path";
import helmet from "helmet";
export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // helmet config
  app.use(helmet());
  const imagePath = path.join(__dirname, "../images");
  app.use("/images", express.static(imagePath));
  app.use("/admin", AdminRoute);
  app.use("/vandor", VandorRoute);
  app.use("/customer", CustomerRoute);
  app.use(ShoppingRoute);
  return app;
};
