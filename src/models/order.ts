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
  restaurants: [{ restaurantId: Schema.Types.ObjectId; items: IOrderItem[] }];
  totalPrice: number;
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
        name: { type: String, required: true },
        required: { type: Boolean, required: true },
        multiple: { type: Boolean, required: true },
        options: [
          {
            name: { type: String, required: true },
            price: { type: Number, required: true },
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
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    totalPrice: { type: Number, required: true },
    restaurants: [
      {
        restaurantId: { type: Schema.Types.ObjectId, required: true },
        items: [orderItemSchema],
      },
    ],
    status: { type: String, required: true },
    tenantId: {
      type: String,
      required: true,
      description:
        "The ID of the tenant (company or factory) the order belongs to",
    },
  },
  { strict: false, timestamps: true },
);

const OrderModel: Model<IOrder> = model<IOrder>("order", orderSchema);
export default OrderModel;
