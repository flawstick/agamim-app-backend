import { Schema, Document, Model, model } from "mongoose";

interface IShift extends Document {
  userId: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface IShiftLean {
  userId: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: string;
}

export const ShiftSchema = new Schema<IShift>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

const ShiftModel: Model<IShift> = model("shift", ShiftSchema);
export default ShiftModel;
