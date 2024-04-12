import weaviate from "weaviate-ts-client";

const weaviateClient = weaviate.client({
  scheme: "http",
  host: "your-weaviate-instance-host.com",
});

export default { client: weaviateClient || null };
