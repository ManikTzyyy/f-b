import { NextResponse } from "next/server";
import { getPublicOrder } from "@/repositories/public/order.repository";

export async function GET(_req, { params }) {
  try {
    const { noNota } = await params;
    if (!/^SO-\d+$/i.test(noNota)) throw new Error("Invalid order number");
    return NextResponse.json({
      success: true,
      data: await getPublicOrder(noNota),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch order" },
      { status: error.message === "Order not found" ? 404 : 400 },
    );
  }
}
