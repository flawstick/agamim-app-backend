import express from "express";
import bcrypt from "bcryptjs";
import { client as WeaviateClient } from "weaviate-ts-client";
import { generateToken } from "@/utils/jwt";

const weaviateClient = new WeaviateClient({
  scheme: "http",
  host: "your-weaviate-instance-host.com",
});

const router = express.Router();
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await weaviateClient.graphql
      .getter()
      .withClassName("User")
      .withFields("username hashedPassword")
      .withWhere({
        operator: "Equal",
        path: ["username"],
        valueString: username,
      })
      .do();

    const user = users.data.Get.User[0];

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Compare provided password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = generateToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
