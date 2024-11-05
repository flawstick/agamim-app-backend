// This file contains the schema for the menu collection in the database
// This is subject to change as we add more features to the menu
// TODO: Add modifier dependence on other modifiers;
// Meaning, if a modifier is selected, another modifier is required
// Or additions are only enabled if a modifier is selected
import { model, Schema, Document, Model } from "mongoose";

export interface IAddition {
  name: string;
  price: number;
  multiple?: boolean;
  indexDaysAvailable?: number[];
  isSpicy?: boolean;
  spiceLevel?: number;
  vegan?: boolean;
  max?: number;
}

export interface IModifier {
  restaurantId?: Schema.Types.ObjectId;
  menuId?: Schema.Types.ObjectId;
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
  modifiers?: Schema.Types.ObjectId[]; // Reference to ModifierModel
  sold?: number;
  vegan?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;
}

export interface ICategoryBase {
  name: string;
  description: string;
  index: number;
}

export interface ICategory extends ICategoryBase, Document {}
export interface ICategoryLean extends ICategoryBase {}

interface IMenuBase {
  restaurantId: Schema.Types.ObjectId;
  categories?: ICategory[];
  items: IMenuItem[];
}

export interface IMenu extends IMenuBase, Document {}
export interface IMenuLean extends IMenuBase {}

// Schemas
const additionSchema = new Schema<IAddition>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  multiple: { type: Boolean, required: true },
  max: { type: Number },
  indexDaysAvailable: { type: [Number] },
  isSpicy: { type: Boolean },
  spiceLevel: { type: Number },
  vegan: { type: Boolean },
});

const modifierSchema = new Schema<IModifier>({
  restaurantId: { type: Schema.Types.ObjectId, ref: "restaurant" },
  menuId: { type: Schema.Types.ObjectId, ref: "menu" },
  name: { type: String, required: true },
  required: { type: Boolean, required: true },
  multiple: { type: Boolean, required: true },
  options: { type: [additionSchema], required: true },
  max: { type: Number },
  indexDaysAvailable: { type: [Number] },
});

// New ModifierModel
const ModifierModel: Model<IModifier> = model<IModifier>(
  "modifier",
  modifierSchema,
);

const menuItemSchema = new Schema<IMenuItem>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "restaurant" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  category: { type: String },
  modifiers: [{ type: Schema.Types.ObjectId, ref: "modifier" }], // Reference to ModifierModel
  sold: { type: Number, default: 0 },
  spiceLevel: { type: Number },
  isSpicy: { type: Boolean },
  vegan: { type: Boolean },
});

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String },
  index: { type: Number, required: true },
});

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    categories: [categorySchema],
    items: [menuItemSchema],
  },
  { timestamps: true },
);

const MenuModel: Model<IMenu> = model<IMenu>("menu", menuSchema);

export { MenuModel, ModifierModel };
export default MenuModel;
