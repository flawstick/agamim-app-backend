// TODO: Create a client schema, add it to client.

const schema = {
  classes: [
    {
      class: "User",
      description: "A piece of writing for publication",
      properties: [
        {
          name: "title",
          dataType: ["string"],
          description: "The title of the article",
        },
        {
          name: "content",
          dataType: ["text"],
          description: "The content of the article",
        },
        {
          name: "author",
          dataType: ["User"],
          description: "The author of the article",
        },
      ],
    },
    {
      class: "User",
      description: "A user of the blog",
      properties: [
        {
          name: "name",
          dataType: ["string"],
          description: "The name of the user",
        },
        {
          name: "email",
          dataType: ["string"],
          description: "The email address of the user",
        },
      ],
    },
  ],
};

// Function to create the schema in Weaviate
async function createSchema() {
  try {
    await client.schema.createClass(schema.classes[0]);
    await client.schema.createClass(schema.classes[1]);
    console.log("Schema created successfully");
  } catch (error) {
    console.error("Failed to create schema:", error);
  }
}

// Call the function to create the schema
createSchema();
