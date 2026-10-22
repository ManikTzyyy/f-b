import { NextResponse } from "next/server";
import { getAccountPagination, createData, updateData, deleteData } from "@/repositories/master/accounts/account.repository";
import { requireApiSession } from "@/lib/auth-server";

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;
  const { searchParams } = new URL(req.url);
  try {
    const result = await getAccountPagination({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 30,
      search: searchParams.get("search") || "",
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

async function getBody(req) {
  const body = await req.json();
  if (!body.name) throw new Error("Name is required");
  return {
    name: body.name,
    type: body.type || null,
    initial_balance: body.initial_balance === "" ? null : Number(body.initial_balance),
  };
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    return NextResponse.json({ success: true, data: await createData(await getBody(req)) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Id is required");
    return NextResponse.json({ success: true, data: await updateData(id, await getBody(req)) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
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
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
