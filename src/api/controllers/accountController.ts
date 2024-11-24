import { Request, Response } from "express";
import { JwtPayload, verify, sign } from "jsonwebtoken";
import { config } from "@/config";
import { log } from "@/utils/log";
import AccountModel from "@/models/account";
import RestaurantModel from "@/models/restaurant";

export const getAccount = async (req: Request, res: Response) => {
  const { jwt } = req.params;

  try {
    const decoded: JwtPayload = verify(
      jwt,
      config.jwtSecret || "",
    ) as JwtPayload;
    const account: any = await AccountModel.findById(decoded.userId);
    res.json({ ...account._doc, at_hash: null });
  } catch (error) {
    log.error("Error handling /accounts/:jwt:", error as any);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export async function getAccountRestaurants(req: Request, res: Response) {
  try {
    const { accountId } = req.params;
    const userId = accountId;

    if (req.body.user.userId !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const restaurants = await RestaurantModel.find({ members: userId });
    res.status(200).json(restaurants);
  } catch (error) {
    log.error("Failed to get account restaurants:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const googleAuth = async (req: Request, res: Response) => {
  const { profile } = req.body;
  const { email, name, given_name, family_name, picture, at_hash } = profile;

  try {
    let account = await AccountModel.findOne({ email });

    if (!account) {
      account = new AccountModel({
        name,
        hashedPassword: at_hash,
        profilePicture: picture,
        email,
        firstName: given_name,
        lastName: family_name,
        teams: [],
      });
      await account.save();
    }

    const token = sign(
      {
        userId: account._id,
        email: account.email,
        name: account.name,
        picture: account.profilePicture,
        firstName: account.firstName,
        lastName: account.lastName,
        teams: account.teams,
      },
      config.jwtSecret || "",
    );

    res.json({ jwt: token });
  } catch (error) {
    log.error("Error handling /auth/google:", error as any);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
