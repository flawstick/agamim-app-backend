import { model, Schema, Document, Model } from "mongoose";

interface IFeedBase {
  user: Schema.Types.ObjectId;
  posts: Schema.Types.ObjectId[];
}

interface IFeed extends IFeedBase, Document {}
export interface IFeedLean extends IFeedBase {}

const feedSchema = new Schema<IFeed>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "post" }],
  },
  { timestamps: true },
);

const FeedModel: Model<IFeed> = model<IFeed>("feed", feedSchema);
export default FeedModel;
