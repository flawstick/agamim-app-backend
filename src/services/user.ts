import UserModel from "@/models/user";

/**
 * Retrieves the hashed password for a given username from MongoDB.
 * @param username The username of the user whose password hash is to be retrieved.
 * @returns A promise that resolves to the user (excluding the hash) and hashed password, or null if not found.
 */
export async function getUserHash(
  username: string,
): Promise<{ user: any; hashedPassword: string | undefined } | null> {
  try {
    const user = await UserModel.findOne({ username }).lean();
    const hashedPassword = user?.hashedPassword;

    return {
      user,
      hashedPassword,
    };
  } catch (error) {
    console.error("Failed to fetch user hash from MongoDB:", error);
    return null;
  }
}

/**
 * add a new user to the database
 * @param user The user object to add
 * @returns A promise that resolves to the user object that was added
 * */
export async function addUser(user: any): Promise<any> {
  try {
    const newUser = await UserModel.create(user);
    return newUser;
  } catch (error) {
    console.error("Failed to add user to MongoDB:", error);
    return null;
  }
}

/**
 * check if a username exists in the database
 * @param username The username of the user to check
 * @returns A promise that resolves to true if the username exists, or false if not
 * */
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const user = await UserModel.findOne({
      username,
    }).lean();

    return !!user;
  } catch (error) {
    console.error("Failed to fetch user from MongoDB:", error);
    return false;
  }
}

/**
 * check if a clock ID exists in the database
 * @param clockId The clock ID of the user to check
 * @returns A promise that resolves to true if the clock ID exists, or false if not
 * */
export async function clockIdExists(clockId: number): Promise<boolean> {
  try {
    const user = await UserModel.findOne({
      clockId,
    }).lean();

    return !!user;
  } catch (error) {
    console.error("Failed to fetch user from MongoDB:", error);
    return false;
  }
}
