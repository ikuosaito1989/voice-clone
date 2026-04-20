import { compareSync } from "bcryptjs";

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}
