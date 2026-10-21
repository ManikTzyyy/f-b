import { NextResponse } from "next/server";
import { getRoles } from "@/repositories/master/roles/role";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;

  try {
    const roles = await getRoles();
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
