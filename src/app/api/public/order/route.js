import { NextResponse } from "next/server";
import { createPublicOrder } from "@/repositories/public/order.repository";

export async function POST(req) {
  try {
    const body = await req.json();
    const table = typeof body.table === "string" ? body.table.trim() : "";
    if (table.length > 50) throw new Error("Table number is too long");

    const data = await createPublicOrder({
      table,
      items: body.items,
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 400 },
    );
  }
}
