import express, { Request, Response, NextFunction } from "express";
import {
  AddFood,
  AddOffer,
  DeleteOffer,
  EditOffer,
  GetCurrentOrders,
  GetFoods,
  GetOffers,
  GetOrderById,
  GetVandorProfile,
  ProcessOrder,
  UpdateVandorCoverPhoto,
  UpdateVandorProfile,
  UpdateVandorService,
  VandorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});
const images = multer({ storage: imageStorage }).array("images", 10);

/* ------------------------- Vandor Section -------------------------- */
router.post("/login", VandorLogin);
router.use(Authenticate);
router.get("/profile", GetVandorProfile);
router.patch("/profile", UpdateVandorProfile);
router.patch("/service", UpdateVandorService);
router.patch("/coverimage", images, UpdateVandorCoverPhoto);

/* ------------------------- Food Section -------------------------- */
router.post("/foods", images, AddFood);
router.get("/foods", GetFoods);

/* ------------------------- Orders Section -------------------------- */
router.get("/orders", GetCurrentOrders);
router.put("/orders/:id/process", ProcessOrder);
router.get("/orders/:id", GetOrderById);

/* ------------------------- Offers Section -------------------------- */
router.get("/offers", GetOffers);
router.post("/offers", AddOffer);
router.put("/offers/:id", EditOffer);
router.delete("/offers/:id", DeleteOffer);
export { router as VandorRoute };
