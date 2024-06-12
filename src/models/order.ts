import { model, Schema, Document, Model } from "mongoose";

interface IOrderItem {
  itemId: Schema.Types.ObjectId;
  quantity: number;
  price: number;
}

interface IOrderBase {
  userId: Schema.Types.ObjectId; // Reference to User
  restaurantId: Schema.Types.ObjectId; // Reference to Restaurant
  items: IOrderItem[];
  totalPrice: number;
  status: string;
  tenantId: string; // Added tenantId field
}

interface IOrder extends IOrderBase, Document {}
export interface IOrderLean extends IOrderBase {}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    items: [
      {
        itemId: { type: Schema.Types.ObjectId, ref: "menu.items" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
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

orderSchema.index({ tenantId: 1 });

const OrderModel: Model<IOrder> = model<IOrder>("order", orderSchema);
export default OrderModel;
