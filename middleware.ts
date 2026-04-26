import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: Request & { nextUrl: URL }) {
  const path = req.nextUrl.pathname;
  if (path === "/admin/login") {
    return NextResponse.next();
  }

  // Keep Edge bundle small: don't import NextAuth config (it pulls Prisma/argon2).
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (path.startsWith("/admin") && !token) {
    const signIn = new URL("/admin/login", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
