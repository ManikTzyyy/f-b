import { NextResponse } from "next/server";

import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "@/repositories/master/users/user.repository";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(req) {
  try {
    const { user, error: authError } = requireApiSession(req);
    if (authError) return authError;
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 30;
    const search = searchParams.get("search") || "";

    const result = await getUser({ page, limit, search });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

async function getBody(req) {
  const body = await req.json();
  const { username, name, password, role_id } = body;
  if (!username || !name || !role_id) {
    throw new Error("Username, name, and role are required");
  }
  return { username, name, password, role_id: Number(role_id) };
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await getBody(req);
    if (!body.password) throw new Error("Password is required");
    const user = await createUser(body);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}

export async function PATCH(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("User id is required");
    const user = await updateUser(id, await getBody(req));
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("User id is required");
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
