import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

import { authOptions } from "@/lib/auth/options";

// Extended session type with guaranteed user.id
export type AuthSession = Session & {
  user: Session["user"] & {
    id: string;
  };
};

export async function getCurrentSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return session as AuthSession | null;
}
