import PostModel, { IPostLean } from "@/models/post";
import { log } from "@/utils/log";

/**
 * add a new user to the database
 * @param user The user object to add
 * @returns A promise that resolves to the user object that was added
 * */
export async function addPost(post: IPostLean): Promise<any> {
  try {
    const newPost = await PostModel.create(post);
    return newPost;
  } catch (error) {
    log.error(`Failed to add post to MongoDB: ${error}`);
    return null;
  }
}
