import { getUserHash } from "@/users";
import { comparePasswords } from "@/utils/bcrypt";
import { log } from "@/utils/log";
import { generateToken } from "@/utils/generateToken";

export default async function loginUser(req: any, res: any) {
  const tenantId = req.headers["x-tenant-id"] as string;
  const { username, password } = req.body.credentials;

  try {
    const { user, hashedPassword } =
      (await getUserHash(username, tenantId)) || {};

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
