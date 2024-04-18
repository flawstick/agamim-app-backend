import { Request, Response } from "express";
import { hashPassword } from "@/utils/bcrypt";
import { usernameExists, clockIdExists, addUser } from "@/services/user";
import { IUserLean } from "@/models/user";
import { log } from "@/utils/log";

export default async function registerUser(req: Request, res: Response) {
  if (!req.body.user)
    return res.status(400).json({ message: "User data not provided" });
  const { username, password, firstName, lastName, clockId } = req.body.user;

  try {
    if (await usernameExists(username))
      return res.status(409).json({ message: "משתמש כבר קיים" });

    if (await clockIdExists(clockId))
      return res.status(409).json({ message: "מספר שעון כבר קיים" });

    const hashedPassword = await hashPassword(password);
    await addUser({
      username,
      hashedPassword,
      firstName,
      lastName,
      clockId,
      hoursWorked: 0,
      shifts: [],
      settings: {},
    } as IUserLean);

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    log.error("Error during registration:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
