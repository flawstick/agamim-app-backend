import { generateToken } from "@/api/middleware/auth";
import { comparePasswords } from "@/utils/bcrypt";
import { getUserHash } from "@/services/user";

export default async function loginUser(req: any, res: any) {
  const { username, password } = req.body;

  try {
    const { user, hashedPassword } = (await getUserHash(username)) || {};
    if (!hashedPassword)
      return res.status(401).json({ message: "Authentication failed" });

    const isValidPassword = await comparePasswords(
      password,
      hashedPassword as string,
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
