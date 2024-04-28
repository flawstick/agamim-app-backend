import jwt from "jsonwebtoken";
import { config } from "@/config";

export const generateToken = (user: any) => {
  const token = jwt.sign(
    {
      ...user,
      hashedPassword: undefined,
      _id: undefined,
      __v: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    },
    config.jwtSecret,
    { expiresIn: "7d" },
  );
  return token;
};
