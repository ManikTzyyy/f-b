import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";
import { getRecipes, createRecipe, deleteRecipe } from "@/repositories/product/menus/menu.repository";

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;
  try {
    const menuId = new URL(req.url).searchParams.get("menu_id");
    if (!menuId) throw new Error("Menu id is required");
    return NextResponse.json({ success: true, data: await getRecipes(menuId) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await req.json();
    if (!body.menu_id || !body.ingredient_id) throw new Error("Menu and ingredient are required");
    const data = await createRecipe({
      menu_id: body.menu_id,
      ingredient_id: body.ingredient_id,
      qty: body.qty === "" || body.qty == null ? null : Number(body.qty),
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Recipe id is required");
    await deleteRecipe(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
