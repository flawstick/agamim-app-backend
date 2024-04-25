import UserModel, { IUserLean } from "@/models/user";
import { log } from "@/utils/log";

/**
 * add a new user to the database
 * @param user The user object to add
 * @returns A promise that resolves to the user object that was added
 * */
export async function addUser(user: IUserLean): Promise<any> {
  try {
    const newUser = await UserModel.create(user);
    return newUser;
  } catch (error) {
    log.error(`Failed to add user to MongoDB: ${error}`);
    return null;
  }
}
