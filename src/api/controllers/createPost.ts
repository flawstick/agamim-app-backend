import { IPostLean } from "@/models/post";
import { addPost } from "@/feed";

export default async function createPost(req: any, res: any) {
  try {
    const { post } = req.body;
    const user = req.body.user;
    if (!post) return res.status(400).json({ message: "Post is required" });

    // Catches type error if post is not IPostLean, no feedback
    await addPost({
      ...post,
      user: user._id,
    } as IPostLean);
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
