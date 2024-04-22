import { generateToken } from "@/api/middleware/auth";
import { comparePasswords } from "@/utils/bcrypt";
import { getUserHash } from "@/services/user";
import { log } from "@/utils/log";

export default async function loginUser(req: any, res: any) {
  const { username, password } = req.body;

  try {
    const { user, hashedPassword } = (await getUserHash(username)) || {};

    if (!user)
      return res
        .status(401)
        .json({ wrongCredential: "username", message: "החשבון הזה לא קיים" });

    const isValidPassword = await comparePasswords(
      password,
      hashedPassword as string,
    );

    if (!isValidPassword)
      return res
        .status(401)
        .json({ wrongCredential: "password", message: "סיסמה שגויה" });

    const token = generateToken(user);
    res.status(200).json({
      token: token,
      userData: {
        ...user,
        _id: undefined,
        username: undefined,
        hashedPassword: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        __v: undefined,
      },
    });
  } catch (error) {
    log.error("Error during authentication:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
