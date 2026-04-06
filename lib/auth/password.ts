import { compareSync, genSaltSync, hashSync } from "bcryptjs";

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}

export function createPasswordHash(password: string) {
  return hashSync(password, genSaltSync(12));
}
