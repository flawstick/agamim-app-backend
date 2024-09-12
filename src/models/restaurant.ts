import { model, Schema, Document, Model } from "mongoose";

interface IRestaurantBase {
  profile: {
    name: string;
    avatar: string;
    banner: string;
  };
  name: string;
  category?: string;
  rating: number;
  menuId?: Schema.Types.ObjectId;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  coordinates?: { lat: number; lng: number };
  members?: Schema.Types.ObjectId[];
  menu?: Schema.Types.ObjectId;
}

interface IRestaurant extends IRestaurantBase, Document {}
export interface IRestaurantLean extends IRestaurantBase {}

const restaurantSchema = new Schema<IRestaurant>(
  {
    profile: {
      name: { type: String, required: true },
      avatar: { type: String, required: true },
      banner: { type: String, required: true },
    },
    name: { type: String, required: true },
    category: { type: String },
    rating: { type: Number },
    menuId: { type: Schema.Types.ObjectId, ref: "menu" },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    members: { type: [Schema.Types.ObjectId], ref: "account" },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    menu: { type: Schema.Types.ObjectId, ref: "menu" },
  },
  { timestamps: true },
);

const RestaurantModel: Model<IRestaurant> = model<IRestaurant>(
  "restaurant",
  restaurantSchema,
);
export default RestaurantModel;
