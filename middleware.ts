import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (path === "/admin/login") {
    return NextResponse.next();
  }
  if (path.startsWith("/admin") && !req.auth) {
    const signIn = new URL("/admin/login", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
