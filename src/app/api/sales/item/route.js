import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";
import {
  createSalesOrderItem,
  deleteSalesOrderItem,
  getSalesOrder,
  getSalesOrderItems,
} from "@/repositories/sales/sales.repository";

function getUuid(value, label) {
  if (!value || !/^[0-9a-f-]{36}$/i.test(String(value))) {
    throw new Error(`${label} must be a valid UUID`);
  }
  return String(value);
}

export async function GET(req) {
  const { error: authError } = requireApiSession(req);
  if (authError) return authError;
  try {
    const soId = new URL(req.url).searchParams.get("so_id");
    if (!soId) throw new Error("Sales order id is required");
    return NextResponse.json({
      success: true,
      data: await getSalesOrderItems(getUuid(soId, "Sales order id")),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await req.json();
    const soId = getUuid(body.so_id, "Sales order id");
    const menuId = getUuid(body.menu_id, "Menu id");
    const qty = Number(body.qty);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 2147483647)
      throw new Error("Quantity must be a positive whole number");
    const order = await getSalesOrder(soId);
    if (order.status !== "draft")
      throw new Error("Confirmed sales order cannot be edited");
    const data = await createSalesOrderItem({
      soId,
      menuId,
      qty,
      note: typeof body.note === "string" ? body.note : "",
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
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
    if (!id) throw new Error("Item id is required");
    await deleteSalesOrderItem(getUuid(id, "Item id"));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
