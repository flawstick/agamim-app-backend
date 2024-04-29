import PostModel, { IPostLean } from "@/models/post";
import { log } from "@/utils/log";
import { fanoutWrite } from "./fanoutWrite";

/**
 * add a new user to the database
 * @param user The user object to add
 * @returns A promise that resolves to the user object that was added
 * */
export async function addPost(post: IPostLean): Promise<any> {
  try {
    const newPost = await PostModel.create(post);
    log.info(`Added post to MongoDB: ${newPost}`);

    // TODO: Filter out posts using algorithm
    await fanoutWrite(newPost._id);

    return newPost;
  } catch (error) {
    log.error(`Failed to add post to MongoDB: ${error}`);
    return null;
  }
}
