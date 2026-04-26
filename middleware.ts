import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === "/admin/login") {
    return NextResponse.next();
  }

  // Keep Edge bundle small: don't import NextAuth config (it pulls Prisma/argon2).
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const cookieCandidates = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  const cookieName = cookieCandidates.find((name) => req.cookies.get(name)?.value);

  const token = await getToken({
    req,
    secret,
    ...(cookieName ? { cookieName } : {}),
  });
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
