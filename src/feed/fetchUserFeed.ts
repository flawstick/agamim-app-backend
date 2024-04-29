import FeedModel from "@/models/feed";
import PostModel, { IPostLean } from "@/models/post";

export async function fetchUserFeed(userId: string): Promise<IPostLean[]> {
  let feed = await FeedModel.findOne({ user: userId }).exec();

  if (!feed) {
    // If no feed exists, fetch data from the main 'posts' collection
    const posts = await PostModel.find()
      .sort({ createdAt: -1 }) // Sorting by creation time
      .limit(10) // Limit the number of posts
      .exec();

    // Create a new feed document for the user
    feed = new FeedModel({
      user: userId,
      posts: posts.map((post) => post._id), // Storing post IDs; consider storing more data
      createdAt: new Date(),
    });

    await feed.save();
  }

  // Fetch full post data for the feed;
  const feedPosts = await PostModel.find({
    _id: { $in: feed.posts },
  })
    .sort({ createdAt: -1 })
    .exec();

  // Make into IPostLean
  return feedPosts.map((post) => post.toObject());
}
