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
  cuisine?: string; // New cuisine field
  menuId?: Schema.Types.ObjectId;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
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
    rating: {
      type: Number,
      default: 0, // Default rating if none is provided
      min: 0,
      max: 5, // Ensures rating is within 1-5 range
    },
    cuisine: { type: String }, // New field for cuisine
    menuId: { type: Schema.Types.ObjectId, ref: "menu" },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    members: { type: [Schema.Types.ObjectId], ref: "account" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    menu: { type: Schema.Types.ObjectId, ref: "menu" },
  },
  { timestamps: true },
);

// Create the 2dsphere index for geospatial queries
restaurantSchema.index({ location: "2dsphere" });

const RestaurantModel: Model<IRestaurant> = model<IRestaurant>(
  "restaurant",
  restaurantSchema,
);

export default RestaurantModel;
