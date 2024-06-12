import { model, Schema, Document, Model } from "mongoose";

interface IRestaurantBase {
  name: string;
  menuId?: Schema.Types.ObjectId;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  coordinates?: { lat: number; lng: number };
  members?: Schema.Types.ObjectId[];
  visibilityRadius?: Schema.Types.ObjectId[];
  menu?: Schema.Types.ObjectId;
}

interface IRestaurant extends IRestaurantBase, Document {}
export interface IRestaurantLean extends IRestaurantBase {}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    menuId: { type: Schema.Types.ObjectId, ref: "menu" },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    members: { type: [Schema.Types.ObjectId], ref: "account" },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    visibilityRadius: { type: [Schema.Types.ObjectId], ref: "restaurant" },
    menu: { type: Schema.Types.ObjectId, ref: "menu" },
  },
  { timestamps: true },
);

const RestaurantModel: Model<IRestaurant> = model<IRestaurant>(
  "restaurant",
  restaurantSchema,
);
export default RestaurantModel;
