import { model, Schema, Document, Model } from "mongoose";

interface IOrderItem {
  _id?: Schema.Types.ObjectId;
  restaurantId?: Schema.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  additions?: [{ name: string; price: number }];
  quantity: number;
}

interface IOrderBase {
  userId: Schema.Types.ObjectId;
  restaurants: [{ restaurantId: Schema.Types.ObjectId; items: IOrderItem[] }];
  totalPrice: number;
  status: "pending" | "accepted" | "cancelled" | "completed";
  tenantId: string;
  createdAt?: Date;
}

interface IOrder extends IOrderBase, Document {}
export interface IOrderLean extends IOrderBase {}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    totalPrice: { type: Number, required: true },
    restaurants: [
      {
        restaurantId: { type: Schema.Types.ObjectId, required: true },
        items: [
          {
            _id: { type: Schema.Types.ObjectId },
            restaurantId: { type: Schema.Types.ObjectId },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: String },
            imageUrl: { type: String },
            category: { type: String },
            additions: [{ name: String, price: Number }],
            sold: { type: Number, default: 0 },
            quantity: { type: Number, required: true },
          },
        ],
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
  { timestamps: true },
);

const OrderModel: Model<IOrder> = model<IOrder>("order", orderSchema);
export default OrderModel;
