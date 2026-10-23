import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";
import {
  confirmSalesOrder,
  createSalesOrder,
  deleteSalesOrder,
  getSalesOrder,
  getSalesPagination,
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
  const { searchParams } = new URL(req.url);
  try {
    const id = searchParams.get("id");
    if (id) {
      return NextResponse.json({
        success: true,
        data: await getSalesOrder(getUuid(id, "Sales order id")),
      });
    }
    return NextResponse.json({
      success: true,
      ...(await getSalesPagination({
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 30,
        search: searchParams.get("search") || "",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await req.json();
    if (!body.so_date || !body.account_id)
      throw new Error("Date and account are required");
    return NextResponse.json(
      {
        success: true,
        data: await createSalesOrder({
          soDate: body.so_date,
          table: body.table,
          accountId: getUuid(body.account_id, "Account id"),
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}

export async function PATCH(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Sales order id is required");
    return NextResponse.json({
      success: true,
      data: await confirmSalesOrder(getUuid(id, "Sales order id")),
    });
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
    if (!id) throw new Error("Sales order id is required");
    await deleteSalesOrder(getUuid(id, "Sales order id"));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
