import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { operatorFullName } from "@/lib/operator-name";
import { verifyMathCaptcha } from "@/lib/math-captcha";
import { touchOperatorActivityIfStale } from "@/lib/touch-operator-activity";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "captchaToken", type: "text" },
        captchaAnswer: { label: "captchaAnswer", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        const captchaToken =
          typeof credentials?.captchaToken === "string" ? credentials.captchaToken : undefined;
        const captchaAnswer =
          credentials?.captchaAnswer !== undefined && credentials?.captchaAnswer !== null
            ? String(credentials.captchaAnswer)
            : undefined;
        if (!email || !password) return null;
        if (!verifyMathCaptcha(captchaToken, captchaAnswer)) return null;

        const user = await prisma.bankOperator.findUnique({
          where: { email: String(email) },
        });
        if (!user) return null;

        const ok = await argon2.verify(user.passwordHash, String(password));
        if (!ok) return null;

        const now = new Date();
        await prisma.bankOperator.update({
          where: { id: user.id },
          data: { lastLogin: now, lastActivity: now },
        });

        return {
          id: user.id,
          email: user.email,
          name: operatorFullName(user),
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "id" in user && "role" in user) {
        token.id = user.id as string;
        token.role = user.role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        const id = token.id as string | undefined;
        if (id) {
          void touchOperatorActivityIfStale(id);
        }
      }
      return session;
    },
  },
});
