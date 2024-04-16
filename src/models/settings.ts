import { model, Schema } from "mongoose";

export const SettingsSchema = new Schema({
  lineNotifs: {
    type: Boolean,
    description: "The user's theme",
  },
  postNotifs: {
    type: String,
    description: "The user's language",
  },
});

const SettingsModel = model("Settings", SettingsSchema);

export default SettingsModel;
