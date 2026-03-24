import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { findUserByEmail, verifyUserPassword } from "@/lib/auth/user-store";
import { userRepository } from "@/infrastructure/repositories/user-repository";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export function isGoogleAuthConfigured() {
  return Boolean(googleClientId && googleClientSecret && googleClientId !== "replace-me" && googleClientSecret !== "replace-me");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(email);

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyUserPassword(user, password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    ...(isGoogleAuthConfigured()
      ? [
          GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Sync user to Supabase on OAuth sign-in
      if (account?.provider === "google" && user.email) {
        try {
          await userRepository.ensureUser({
            id: user.id,
            email: user.email,
            name: user.name,
          });
        } catch (error) {
          console.error("Failed to sync user to Supabase:", error);
          // Don't block sign-in if Supabase sync fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, save user info to token
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        
        // For Google OAuth, get the DB user ID
        if (user.email && account?.provider === "google") {
          try {
            const dbUser = await userRepository.findByEmail(user.email);
            if (dbUser) {
              token.sub = dbUser.id;
              token.dbUserId = dbUser.id;
            }
          } catch (error) {
            console.error("Failed to fetch user from DB:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Use dbUserId if available, fallback to sub
        session.user.id = (token.dbUserId as string) || token.sub || "";
        // Pass through name, email, and image from token
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }

      return session;
    },
  },
};
