import db from "@/config/db";

/**
 * Retrieves the hashed password for a given username using Weaviate.
 * @param username The username of the user whose password hash is to be retrieved.
 * @returns A promise that resolves to the user (without hash) and hashed password or null if not found.
 */
export async function getUserHash(
  username: string,
): Promise<{ user: any; hashedPassword: string } | null> {
  try {
    const result = await db.client.graphql
      .get()
      .withClassName("User")
      .withFields("hashedPassword")
      .withWhere({
        path: ["username"],
        operator: "Equal",
        valueString: username,
      })
      .do();

    if (result.data.Get.User.length > 0) {
      const user = result.data.Get.User[0];
      delete user.hashedPassword;

      return {
        user: user,
        hashedPassword: result.data.Get.User[0].hashedPassword,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user hash from Weaviate:", error);
    return null;
  }
}
