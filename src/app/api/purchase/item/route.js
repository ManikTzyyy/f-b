import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";
import { getPurchase, getPurchaseItems, createPurchaseItem, deletePurchaseItem } from "@/repositories/purchase/purchase.repository";

function getPurchaseUuid(value) {
  if (!value || !/^[0-9a-f-]{36}$/i.test(String(value))) {
    throw new Error("Purchase id must be a valid UUID");
  }
  return String(value);
}

function getNumericItemId(value) {
  if (!/^\d+$/.test(String(value))) {
    throw new Error("Item id must be numeric");
  }
  return Number(value);
}

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;
  try {
    const poId = new URL(req.url).searchParams.get("po_id");
    if (!poId) throw new Error("Purchase id is required");
    return NextResponse.json({ success: true, data: await getPurchaseItems(getPurchaseUuid(poId)) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await req.json();
    const poId = getPurchaseUuid(body.po_id);
    const purchase = await getPurchase(poId);
    if (purchase.status !== "draft") throw new Error("Confirmed purchase cannot be edited");
    if (!body.ingredient_id || Number(body.qty) <= 0 || Number(body.unit_cost) < 0) {
      throw new Error("Ingredient, quantity, and unit cost are required");
    }
    return NextResponse.json({ success: true, data: await createPurchaseItem({
      poId, ingredientId: body.ingredient_id, qty: body.qty, unitCost: body.unit_cost,
    }) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Item id is required");
    await deletePurchaseItem(getNumericItemId(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
