import { model, Schema, Document, Model } from "mongoose";
import { IModifier } from "@/models/menu";

interface IOrderItem {
  _id?: Schema.Types.ObjectId;
  restaurantId?: Schema.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  modifiers?: IModifier[];
  quantity: number;
  [key: string]: any;
}

interface IOrderBase {
  userId: Schema.Types.ObjectId;
  restaurantId: Schema.Types.ObjectId;
  totalPrice: number;
  discountedPrice?: number;
  status: "pending" | "confirmed" | "cancelled" | "done" | "delivered";
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface IOrder extends IOrderBase, Document {}
export interface IOrderLean extends IOrderBase {}

const orderItemSchema = new Schema<IOrderItem>(
  {
    _id: { type: Schema.Types.ObjectId },
    restaurantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    category: { type: String },
    modifiers: [
      {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String, required: true },
        required: { type: Boolean, required: true },
        multiple: { type: Boolean, required: true },
        max: { type: Number },
        options: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            multiple: { type: Boolean, required: false },
            quantity: { type: Number, required: false },
          },
        ],
      },
    ],
    sold: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
  },
  { strict: false },
);

const orderSchema = new Schema<IOrder>(
  {
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, required: true },
    restaurantId: { type: Schema.Types.ObjectId, required: true },
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number },
    status: { type: String, required: true },
    tenantId: { type: String, required: true },
    items: [orderItemSchema],
  },
  { strict: false, timestamps: true },
);

const OrderModel: Model<IOrder> = model<IOrder>("order", orderSchema);
export default OrderModel;
