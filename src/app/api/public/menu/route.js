import { NextResponse } from "next/server";
import { getMenuPagination } from "@/repositories/product/menus/menu.repository";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  try {
    const result = await getMenuPagination({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 30,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
