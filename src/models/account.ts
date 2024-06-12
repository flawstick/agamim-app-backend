import { model, Schema, Document, Model } from "mongoose";

interface IAccountBase {
  email: string;
  hashedPassword: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  teams?: Schema.Types.ObjectId[];
}

interface IAccount extends IAccountBase, Document {}
export interface IAccountLean extends IAccountBase {}

const accountSchema = new Schema<IAccount>(
  {
    name: { type: String, required: false, unique: false },
    hashedPassword: { type: String, required: true, unique: false },
    profilePicture: { type: String, required: false, unique: false },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: false, unique: false },
    lastName: { type: String, required: false, unique: false },
    teams: { type: [Schema.Types.ObjectId], required: true, unique: false },
  },
  { timestamps: true },
);

const AccountModel: Model<IAccount> = model<IAccount>("account", accountSchema);
export default AccountModel;
