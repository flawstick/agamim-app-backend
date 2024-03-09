import jwt from "jsonwebtoken";

export function generateToken(user: any) {
  return jwt.sign(
    { payload: { username: user.username } },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
    (err, asyncToken) => {
      if (err) {
        console.error("JWT signing error:", err);
        return err.message;
      }
      return asyncToken;
    },
  );
}
