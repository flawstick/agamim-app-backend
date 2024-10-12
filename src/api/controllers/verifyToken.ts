import { Request, Response } from "express";
import { log } from "@/utils/log";
import UserModel, { IUser } from "@/models/user";
import { verify } from "jsonwebtoken";

export default async function verifyUserToken(req: Request, res: Response) {
  let token: string | undefined;

  try {
    token = req.headers.authorization?.split(" ")[1] || req.body.token;
    const decoded: IUser = verify(
      token as string,
      process.env.JWT_SECRET as string,
    ) as IUser;

    const user = await UserModel.exists({ _id: decoded._id as string });
    if (!user) return res.status(401).json({ message: "No such user" });

    if (!req.body.user)
      return res.status(401).json({ message: "Unauthorized" });
    log.info(`User ${user?._id} verified successfully!`);
    return res.status(200).json({ user });
  } catch (error) {
    log.error(`Failed to verify user token: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
}
