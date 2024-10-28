import { model, Schema, Document, Model } from "mongoose";

export interface IAddition {
  name: string;
  price: number;
  multiple?: boolean;
  indexDaysAvailable?: number[];
  max?: number;
}

export interface IModifier {
  name: string;
  required: boolean;
  multiple: boolean;
  options: IAddition[];
  max?: number;
  indexDaysAvailable?: number[];
}

export interface IMenuItem {
  _id?: Schema.Types.ObjectId;
  restaurantId?: Schema.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  modifiers?: IModifier[];
  sold?: number;
}

interface IMenuBase {
  restaurantId: Schema.Types.ObjectId;
  categories?: string[];
  items: IMenuItem[];
}

interface IMenu extends IMenuBase, Document {}
export interface IMenuLean extends IMenuBase {}

const additionSchema = new Schema<IAddition>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  multiple: { type: Boolean, required: true },
  max: { type: Number },
  indexDaysAvailable: { type: [Number] },
});

const modifierSchema = new Schema<IModifier>({
  name: { type: String, required: true },
  required: { type: Boolean, required: true },
  multiple: { type: Boolean, required: true },
  options: { type: [additionSchema], required: true },
  max: { type: Number },
  indexDaysAvailable: { type: [Number] },
});

const menuItemSchema = new Schema<IMenuItem>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "restaurant" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  category: { type: String },
  modifiers: { type: [modifierSchema] },
  sold: { type: Number, default: 0 },
});

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    categories: [String],
    items: [menuItemSchema],
  },
  { timestamps: true },
);

const MenuModel: Model<IMenu> = model<IMenu>("menu", menuSchema);
export default MenuModel;
