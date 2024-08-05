import { Request, Response } from "express";
import { log } from "@/utils/log";

export default async function verifyUserToken(req: Request, res: Response) {
  if (!req.body.user) return res.status(401).json({ message: "Unauthorized" });
  log.info(`User ${req.body.user.username} verified successfully!`);
  return res.status(200).json({ user: req.body.user });
}
