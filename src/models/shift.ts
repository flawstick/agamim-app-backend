import { Schema, model } from "mongoose";

export const ShiftSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true },
);

const ShiftModel = model("Shift", ShiftSchema);

export default ShiftModel;
