import { NextResponse } from "next/server";
import { getMenuCategory } from "@/repositories/master/menu-category/menu-category.repositoris";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  try {
    const result = await getMenuCategory({
      page: 1,
      limit: 100,
      search: searchParams.get("search") || "",
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
