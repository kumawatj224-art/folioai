import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const authDataDir = path.join(process.cwd(), ".data");
const authUsersFile = path.join(authDataDir, "auth-users.json");

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

async function ensureStore() {
  await mkdir(authDataDir, { recursive: true });

  try {
    await readFile(authUsersFile, "utf8");
  } catch {
    await writeFile(authUsersFile, "[]", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();

  const file = await readFile(authUsersFile, "utf8");

  try {
    const parsed = JSON.parse(file) as StoredUser[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await ensureStore();
  await writeFile(authUsersFile, JSON.stringify(users, null, 2), "utf8");
}

async function hashPassword(password: string, salt: string) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return derivedKey.toString("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);

  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function createUser({ name, email, password }: CreateUserInput) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordSalt = randomUUID();
  const passwordHash = await hashPassword(password, passwordSalt);

  const user: StoredUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    passwordSalt,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
}

export async function verifyUserPassword(user: StoredUser, password: string) {
  const inputHash = await hashPassword(password, user.passwordSalt);

  return timingSafeEqual(Buffer.from(user.passwordHash, "hex"), Buffer.from(inputHash, "hex"));
}