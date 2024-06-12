import { model, Schema, Document, Model } from "mongoose";

interface IUserBase {
  tenantId: string;
  username: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  profile?: IProfile;
  lastLogin?: Date;
  clockId?: number;
  hoursWorked?: number;
  shifts?: any[];
  settings?: ISettings;
}

interface IUser extends IUserBase, Document {}
export interface IUserLean extends IUserBase {}

export interface IProfile {
  bio: string;
  profilePicture: string;
  coverPicture: string;
}

export interface ISettings {
  lineNotifications?: boolean;
  postNotifications?: boolean;
}

const UserSchema = new Schema<IUser>(
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
    tenantId: {
      type: String,
      required: true,
      description:
        "The ID of the tenant (company or factory) the user belongs to",
    },
    profile: {
      bio: { type: String, description: "The user's bio" },
      profilePicture: {
        type: String,
        description: "The user's profile picture",
      },
      coverPicture: { type: String, description: "The user's cover picture" },
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
        ref: "shift",
        description: "The shifts the user has worked",
      },
    ],
    settings: {
      lineNotifications: {
        type: Boolean,
        default: false,
        description: "Whether the user wants to receive Line notifications",
      },
      postNotifications: {
        type: Boolean,
        default: true,
        description: "Whether the user wants to receive post notifications",
      },
    },
  },
  { timestamps: true },
);

const UserModel: Model<IUser> = model<IUser>("user", UserSchema);
export default UserModel;
