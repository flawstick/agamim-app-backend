import { model, Schema } from "mongoose";

export const SettingsSchema = new Schema({
  lineNotifs: {
    type: Boolean,
    required: true,
    description: "The user's theme",
  },
  postNotifs: {
    type: String,
    required: true,
    description: "The user's language",
  },
});

const SettingsModel = model("Settings", SettingsSchema);

export default SettingsModel;
