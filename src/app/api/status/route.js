import { updateKitchenOrderProgress } from "@/repositories/status/order_status.repository";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const { id, progress } = await req.json();
    if (!id || !/^[0-9a-f-]{36}$/i.test(String(id))) {
      throw new Error("Order id must be a valid UUID");
    }
    const allowedProgress = ["pending", "cooking", "ready", "delivered"];
    if (!allowedProgress.includes(progress)) {
      throw new Error("Invalid order progress");
    }
    const data = await updateKitchenOrderProgress(String(id), progress);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
