import jwt from "jsonwebtoken";
import { config } from "@/config";

const publicRoutes = [
  "/auth/login",
  "/auth/app/google",
  "/companies/available",
];

export const verifyJsonWebToken = (req: any, res: any, next: any) => {
  const isPublicRoute = publicRoutes.some((route) =>
    req.path.startsWith(route),
  );

  if (isPublicRoute) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    req.body.user = decoded;
    next();
  });
};
