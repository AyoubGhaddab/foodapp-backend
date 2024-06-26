import mongoose, { Schema, Document, Model } from "mongoose";

export interface VandorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailble: boolean;
  coverImages: [string];
  rating: number;
  foods: any;
  lat: number;
  lng: number;
}

const VandorSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailble: { type: Boolean },
    coverImages: { type: [String] },
    rating: { type: Number },
    lat: { type: Number },
    lng: { type: Number },
    foods: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "food",
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);
const Vandor = mongoose.model<VandorDoc>("vandor", VandorSchema);
export { Vandor };
