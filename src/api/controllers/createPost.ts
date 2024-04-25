import { IPostLean } from "@/models/post";
import { addPost } from "@/feed";

export default function createPost(req: any, res: any) {
  try {
    const newPost: IPostLean = req.body.post;
    addPost(newPost as IPostLean);

    res.status(200).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
