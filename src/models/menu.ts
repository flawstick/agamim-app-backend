import { model, Schema, Document, Model } from "mongoose";

export interface IMenuItem {
  _id?: Schema.Types.ObjectId;
  restaurantId?: Schema.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  additions?: [{ name: string; price: number }];
  sold?: number;
}

interface IMenuBase {
  restaurantId: Schema.Types.ObjectId; // Reference to Restaurant
  categories?: string[];
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
    categories: [String],
    items: [
      {
        _id: { type: Schema.Types.ObjectId },
        restaurantId: { type: Schema.Types.ObjectId },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        imageUrl: { type: String },
        additions: [{ name: String, price: Number }],
        category: { type: String },
        sold: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

const MenuModel: Model<IMenu> = model<IMenu>("menu", menuSchema);
export default MenuModel;
