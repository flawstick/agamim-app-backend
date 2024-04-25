import { model, Schema, Document, Model } from "mongoose";

interface IPostBase {
  user: Schema.Types.ObjectId;
  content: {
    text: string;
    images?: string[];
    videos?: string[];
  };
  reactions?: {
    likes: Schema.Types.ObjectId[];
    comments: IComment[];
  };
  metadata?: {
    sharesCount: number;
    commentsCount: number;
  };
}

interface IPost extends IPostBase, Document {}
export interface IPostLean extends IPostBase {}

export interface IComment {
  user: Schema.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    content: {
      text: String,
      images: [String],
      videos: [String],
    },
    reactions: {
      likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
      comments: [
        {
          user: { type: Schema.Types.ObjectId, ref: "user" },
          text: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    metadata: {
      sharesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const Post: Model<IPost> = model<IPost>("post", postSchema);
export default Post;
