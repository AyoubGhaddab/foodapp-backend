import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string;
  vandorId: string;
  items: [any];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;

  orderStatus: string;
  remarks: string;
  deliveryId: string;
  readyTime: number; // max 60
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vandorId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    orderDate: { type: Date, required: true },
    orderStatus: { type: String, required: true },
    remarks: { type: String },
    deliveryId: { type: String },

    readyTime: { type: Number },
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
const Order = mongoose.model<OrderDoc>("order", OrderSchema);
export { Order };
