import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { Roles } from "@/lib/roles";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname === "/staff/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage && isLoggedIn) {
    if (role === Roles.CLIENT) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
    return NextResponse.redirect(new URL("/staff", req.url));
  }

  if (pathname.startsWith("/portal")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== Roles.CLIENT) {
      return NextResponse.redirect(new URL("/staff", req.url));
    }
  }

  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role === Roles.CLIENT) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*", "/staff/:path*", "/login", "/register", "/staff/login"],
};
