import { Request, Response } from "express";
import { hashPassword } from "@/utils/bcrypt";
import { usernameExists, clockIdExists, addUser } from "@/services/user";

export async function registerUser(req: Request, res: Response) {
  const { username, password, FirstName, LastName, profilePicture, clockId } =
    req.body;

  try {
    if (await usernameExists(username))
      return res.status(409).json({ message: "משתמש כבר קיים" }); // User already exists

    if (await clockIdExists(clockId))
      return res.status(409).json({ message: "מספר שעון כבר קיים" }); // ClockId already exists

    const hashedPassword = await hashPassword(password);
    await addUser({
      username: username,
      password: hashedPassword,
      firstName: FirstName,
      lastName: LastName,
      profilePicture: profilePicture,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
