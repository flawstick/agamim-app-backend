import { model, Schema, Document, Model } from "mongoose";

interface IUserMonthlyPayment extends Document {
  userId: Schema.Types.ObjectId;
  month: number;
  year: number;
  totalPayment: number;
  numberOfOrders: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userMonthlyPaymentSchema = new Schema<IUserMonthlyPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    month: { type: Number, required: true }, // 0 for January, 11 for December
    year: { type: Number, required: true },
    totalPayment: { type: Number, required: true },
    numberOfOrders: { type: Number, required: true },
  },
  { timestamps: true },
);

const UserMonthlyPaymentModel: Model<IUserMonthlyPayment> =
  model<IUserMonthlyPayment>("userMonthlyPayment", userMonthlyPaymentSchema);

export default UserMonthlyPaymentModel;
