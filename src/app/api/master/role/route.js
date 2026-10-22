import { NextResponse } from "next/server";
import {
  getRoles,
  getRolePagination,
} from "@/repositories/master/roles/role.repository";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 30;
  const search = searchParams.get("search") || "";

  try {
    if (searchParams) {
      const result = await getRolePagination({ page, limit, search });
      return NextResponse.json({ success: true, ...result });
    }

    const roles = await getRoles();
    return NextResponse.json({ success: true, ...roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
