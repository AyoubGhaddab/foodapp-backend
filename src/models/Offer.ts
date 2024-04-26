import mongoose, { Schema, Document, Model } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string; // VENDOR // GENERIC
  vandors: [any]; // ['876689bdyuzbydz']
  title: string; // -10euro on weekend
  description: string; // any description
  minValue: number; // minumum order amount
  offerAmount: number; // 10
  startValidity: Date; // today
  endValidity: Date; // 02/06/2024
  promocode: string; // WEEKMIN10
  promoType: string; // USER // ALL // BANK // CARD
  bank: [any];
  bins: [any];
  pincode: string; // area availabke
  isActive: boolean; //
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, require: true },
    vandors: [{ type: Schema.Types.ObjectId, ref: "vandor" }],
    title: { type: String, require: true },
    description: { type: String },
    minValue: { type: Number, require: true },
    offerAmount: { type: Number, require: true },
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String, require: true },
    promoType: { type: String, require: true },
    bank: [{ type: String }],
    bins: [{ type: Number }],
    pincode: { type: String, require: true },
    isActive: Boolean,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
