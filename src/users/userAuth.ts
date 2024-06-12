import UserModel, { IUserLean } from "@/models/user";
import { log } from "@/utils/log";

/**
 * Retrieves the hashed password for a given username and tenant from MongoDB.
 * @param username The username of the user whose password hash is to be retrieved.
 * @param tenantId The tenant ID of the user's company or factory.
 * @returns A promise that resolves to the user (excluding the hash) and hashed password, or null if not found.
 */
export async function getUserHash(
  username: string,
  tenantId: string,
): Promise<{
  user: IUserLean | null;
  hashedPassword: string | undefined;
} | null> {
  try {
    const user = await UserModel.findOne({ username, tenantId }).lean();
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
 * Checks if a username exists in the database for a specific tenant.
 * @param username The username of the user to check.
 * @param tenantId The tenant ID of the user's company or factory.
 * @returns A promise that resolves to true if the username exists, or false if not.
 */
export async function usernameExists(
  username: string,
  tenantId: string,
): Promise<boolean> {
  try {
    const user = await UserModel.findOne({ username, tenantId }).lean();
    return !!user;
  } catch (error) {
    log.error("Failed to fetch user from MongoDB:", error as Error);
    return false;
  }
}

/**
 * Checks if a clock ID exists in the database for a specific tenant.
 * @param clockId The clock ID of the user to check.
 * @param tenantId The tenant ID of the user's company or factory.
 * @returns A promise that resolves to true if the clock ID exists, or false if not.
 */
export async function clockIdExists(
  clockId: number,
  tenantId: string,
): Promise<boolean> {
  try {
    const user = await UserModel.findOne({ clockId, tenantId }).lean();
    return !!user;
  } catch (error) {
    log.error("Failed to fetch user from MongoDB:", error as Error);
    return false;
  }
}
