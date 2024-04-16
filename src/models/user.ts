import { model, Schema, Document, Model } from "mongoose";
import { SettingsSchema } from "./settings";

export interface IUser extends Document {
  username: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  lastLogin?: Date;
  clockId?: number;
  hoursWorked?: number;
  shifts?: any[];
  settings?: any;
}

export interface IUserLean {
  username: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  lastLogin?: Date;
  clockId?: number;
  hoursWorked?: number;
  shifts?: any[];
  settings?: any;
}

export const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      description: "The user's unique username",
    },
    hashedPassword: {
      type: String,
      required: true,
      description: "The user's password, securely hashed",
    },
    firstName: { type: String, description: "The user's first name" },
    lastName: { type: String, description: "The user's last name" },
    profilePicture: {
      type: String,
      description: "The URL of the user's profile picture",
    },
    lastLogin: { type: Date, description: "The last login date of the user" },
    clockId: {
      type: Number,
      unique: true,
      description: "The user's unique clock ID",
    },
    hoursWorked: {
      type: Number,
      default: 0,
      description: "The number of hours the user has worked",
    },
    shifts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Shift",
        description: "The shifts the user has worked",
      },
    ],
    settings: {
      type: SettingsSchema,
      description: "The user's personal settings",
    },
  },
  { timestamps: true },
);

const UserModel: Model<IUser> = model<IUser>("user", UserSchema);
export default UserModel;
