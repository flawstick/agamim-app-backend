import weaviate from "weaviate-ts-client";
import { config } from "@/config";
import { updateAllClasses } from "@/services/schema";

const weaviateClient = weaviate.client({
  scheme: "http",
  host: config.weaviateUri,
});

export default { client: weaviateClient || null, updateAllClasses };
