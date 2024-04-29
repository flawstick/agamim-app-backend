import { Request, Response } from "express";
import { fetchUserFeed } from "@/feed/fetchUserFeed";

export default async function createFeed(req: Request, res: Response) {
  const userId = req.body.user._id;

  if (!userId) {
    return res.status(400).send("User ID is required.");
  }

  try {
    const feed = await fetchUserFeed(userId);
    return res.status(200).send(feed);
  } catch (error) {
    console.error("Failed to create or fetch feed:", error);
    return res.status(500).send("Internal server error");
  }
}
