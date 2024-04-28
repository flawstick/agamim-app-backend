import { Request, Response } from "express";

export default async function verifyUserToken(req: Request, res: Response) {
  if (!req.body.user) return res.status(401).json({ message: "Unauthorized" });
  return res.status(200).json({ user: req.body.user });
}
