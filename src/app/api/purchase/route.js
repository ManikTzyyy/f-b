import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth-server";
import { getPurchasePagination, createPurchase, getPurchase, confirmPurchase, deletePurchase } from "@/repositories/purchase/purchase.repository";

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
    if (id) return NextResponse.json({ success: true, data: await getPurchase(getUuid(id, "Purchase id")) });
    return NextResponse.json({ success: true, ...(await getPurchasePagination({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 30,
      search: searchParams.get("search") || "",
    })) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const body = await req.json();
    if (!body.po_date || !body.supplier_id || !body.account_id) {
      throw new Error("Date, supplier, and account are required");
    }
    return NextResponse.json({
      success: true,
      data: await createPurchase({
        poDate: body.po_date,
        supplierId: body.supplier_id,
        accountId: body.account_id,
      }),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Purchase id is required");
    return NextResponse.json({ success: true, data: await confirmPurchase(getUuid(id, "Purchase id")) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { error: authError } = requireApiSession(req);
    if (authError) return authError;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new Error("Purchase id is required");
    await deletePurchase(getUuid(id, "Purchase id"));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
