import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(req) {
  const { user, error } = requireApiSession(req);
  if (error) {
    return error;
  }
  return NextResponse.json({
    success: true,
    user,
  });
}
