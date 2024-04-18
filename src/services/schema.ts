import db from "@/config/db";
import fs from "fs";
import path from "path";
import { log } from "@/utils/log";

/*
 * This function will update the schema with all the classes present in the schema directory.
 * @param schemaDirectory: The directory where all the schema files are present.
 * @returns Promise<void>
 */
export async function updateAllClasses(schemaDirectory: string): Promise<void> {
  const files = fs.readdirSync(schemaDirectory);
  const classes = files.map((file) => {
    const filePath = path.join(schemaDirectory, file);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  });

  try {
    await Promise.all(
      classes.map((classDef) => {
        return db.weaviateClient.schema.classCreator().withClass(classDef).do();
      }),
    );
    log.info("Schema updated successfully with all classes.");
  } catch (err) {
    log.error("Failed to update schema with classes:", err as Error);
  }
}
