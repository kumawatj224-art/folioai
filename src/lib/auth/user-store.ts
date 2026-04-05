import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { supabase } from "@/lib/supabase/client";

const scrypt = promisify(scryptCallback);

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

async function hashPassword(password: string, salt: string) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return derivedKey.toString("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .single();

  if (error) {
    console.error("Database error:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    passwordSalt: data.password_salt,
    createdAt: data.created_at,
  };
}

export async function createUser({ name, email, password }: CreateUserInput) {
  const normalizedEmail = normalizeEmail(email);

  // Check if email already exists
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordSalt = randomUUID();
  const passwordHash = await hashPassword(password, passwordSalt);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        password_salt: passwordSalt,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.password_hash,
    passwordSalt: data.password_salt,
    createdAt: data.created_at,
  };
}

export async function verifyUserPassword(user: StoredUser, password: string) {
  const inputHash = await hashPassword(password, user.passwordSalt);
  
  try {
    timingSafeEqual(
      Buffer.from(user.passwordHash),
      Buffer.from(inputHash)
    );
    return true;
  } catch {
    return false;
  }
}