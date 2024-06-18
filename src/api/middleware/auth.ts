import jwt from "jsonwebtoken";
import { config } from "@/config";

export const verifyJsonWebToken = (req: any, res: any, next: any) => {
  if (req.path.includes("/login") || req.path.includes("/app/")) return next();
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    req.body.user = decoded;
    next();
  });
};
