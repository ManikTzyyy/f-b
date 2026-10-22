import { requireApiSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { getIngredientPagination, getById, createData, updateData, deleteData } from "@/repositories/product/ingredients/ingredient.repository";

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;
  const { searchParams } = new URL(req.url);
  try {
    const id = searchParams.get("id");
    if (id) {
      return NextResponse.json({ success: true, data: await getById(id) });
    }
    const result = await getIngredientPagination({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 30,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
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
    category_id: body.category_id ? Number(body.category_id) : null,
    name: body.name,
    unit: body.unit || null,
    current_stock: body.current_stock === "" || body.current_stock == null
      ? null
      : Number(body.current_stock),
    images: body.images || null,
  };
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const data = await createData(await getBody(req));
    return NextResponse.json({ success: true, data }, { status: 201 });
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
    const data = await updateData(id, await getBody(req));
    return NextResponse.json({ success: true, data });
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