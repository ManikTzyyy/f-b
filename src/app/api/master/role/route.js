import { NextResponse } from "next/server";
import {
  getRoles,
  getRolePagination,
  createData,
  updateData,
  deleteData,
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

async function getBody(req) {
  const body = await req.json();
  const { name } = body;
  if (!name) {
    throw new Error("Name");
  }
  return { name };
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await getBody(req);
    const data = await createData(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
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
    if (!id) throw new Error("Id is required");
    const data = await updateData(id, await getBody(req));
    return NextResponse.json({ success: true, data });
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
    if (!id) throw new Error("Id is required");
    await deleteData(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
