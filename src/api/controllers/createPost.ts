import { IPostLean } from "@/models/post";
import { addPost } from "@/feed";

export default function createPost(req: any, res: any) {
  try {
    const { post } = req.body;
    if (!post) return res.status(400).json({ message: "Post is required" });

    // Catches type error if post is not IPostLean, no feedback
    addPost(post as IPostLean);
    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
