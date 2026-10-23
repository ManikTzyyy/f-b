import {
  getKitchenOrders,
  updateKitchenOrderProgress,
} from "@/repositories/status/order_status.repository";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  try {
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const progress = searchParams.get("progress") || "";
    const result = await getKitchenOrders(page, limit, progress);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

