import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=session_missing", req.url)
    );
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(
      token,
      secret
    );

    console.log(payload)

    return NextResponse.next();
  } catch (err) {
  
    const response = NextResponse.redirect(
      new URL("/login?error=session_invalid", req.url)
    );
    response.cookies.set("session", "", {
      maxAge: 0,
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: [
    "/master/:path*",
    "/purchase/:path*",
    "/sales/:path*",
    "/product/:path*",
  ],
};