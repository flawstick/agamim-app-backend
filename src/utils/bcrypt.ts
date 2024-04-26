import bcrypt from "bcryptjs";

/*
 * Hashes a password using bcrypt
 * @param {string} password The password to
 * @param {number} rounds The number of rounds to use for hashing
 * @returns A promise that resolves to the hashed
 * */
export async function hashPassword(
  password: string,
  rounds: number = 10,
): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/*
 * Compares a password to a hashed password
 * @param {string} password The password to compare
 * @param {string} hashedPassword The hashed password to compare
 * @returns A promise that resolves to true if the passwords match, or false if not
 * */
export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
