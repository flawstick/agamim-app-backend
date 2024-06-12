import mongoose from "mongoose";
import FeedModel from "@/models/feed";
import UserModel from "@/models/user";
import PostModel from "@/models/post";
import { log } from "@/utils/log";

/*
 * updates every user's feed with the new post
 * @param {mongoose.Types.ObjectId} postId - the _id of the post
 * @returns {Promise<void>}
 * */
export async function fanoutWrite(
  postId: mongoose.Types.ObjectId,
): Promise<void> {
  try {
    const post = await PostModel.findById(postId).exec();
    if (!post) {
      log.error("Post not found");
      return;
    }

    const { tenantId } = post;
    const users = await UserModel.find({ tenantId }).select("_id").exec();

    const updates = users.map((user) => {
      return FeedModel.findOneAndUpdate(
        { user: user._id },
        { $push: { posts: postId } },
        { upsert: true },
      ).exec();
    });

    await Promise.all(updates);
    log.info(`Fanout write complete for post ${postId} and tenant ${tenantId}`);
  } catch (error) {
    log.error("Failed to fanout write:", error as Error);
  }
}
