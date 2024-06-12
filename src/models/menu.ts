import { model, Schema, Document, Model } from "mongoose";

interface IMenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  additions?: string[];
  sold?: number;
}

interface IMenuBase {
  restaurantId: Schema.Types.ObjectId; // Reference to Restaurant
  items: IMenuItem[];
}

interface IMenu extends IMenuBase, Document {}
export interface IMenuLean extends IMenuBase {}

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        additions: [String],
        category: { type: String },
        sold: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

const MenuModel: Model<IMenu> = model<IMenu>("menu", menuSchema);
export default MenuModel;
