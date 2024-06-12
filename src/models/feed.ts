import { model, Schema, Document, Model } from "mongoose";

interface IFeedBase {
  user: Schema.Types.ObjectId;
  posts: Schema.Types.ObjectId[];
  tenantId: string;
}

interface IFeed extends IFeedBase, Document {}
export interface IFeedLean extends IFeedBase {}

const feedSchema = new Schema<IFeed>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "post" }],
    tenantId: {
      type: String,
      required: true,
      description:
        "The ID of the tenant (company or factory) the feed belongs to",
    },
  },
  { timestamps: true },
);

const FeedModel: Model<IFeed> = model<IFeed>("feed", feedSchema);
export default FeedModel;
