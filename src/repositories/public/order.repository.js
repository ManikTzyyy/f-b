import { supabase } from "@/lib/supabase";
import { confirmSalesOrder } from "@/repositories/sales/sales.repository";

const getPublicOrderAccount = async () => {
  const configuredAccountId = process.env.PUBLIC_ORDER_ACCOUNT_ID;
  if (configuredAccountId) {
    const { data, error } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", configuredAccountId)
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, type")
    .or("type.ilike.%cash%,name.ilike.%cash%")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      "No cash account is configured for public orders. Set PUBLIC_ORDER_ACCOUNT_ID.",
    );
  }
  return data.id;
};

const createSales = async ({ soDate, table, accountId }) => {
  const { data: config, error: configError } = await supabase
    .from("config_no")
    .select("id, count")
    .eq("ref", "so")
    .single();
  if (configError) throw configError;
  const nextCount = Number(config.count || 0) + 1;
  const { error: updateError } = await supabase
    .from("config_no")
    .update({ count: nextCount })
    .eq("id", config.id);
  if (updateError) throw updateError;

  const { data, error } = await supabase
    .from("sales_orders")
    .insert({
      so_no: `SO-${String(nextCount).padStart(5, "0")}`,
      so_date: soDate,
      table: table || null,
      account_id: accountId,
      total_amount: 0,
      status: "draft",
      progress: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

const createSalesItem = async ({ soId, menuId, qty, note }) => {
  if (!/^[0-9a-f-]{36}$/i.test(String(menuId)))
    throw new Error("Menu id must be a valid UUID");
  const quantity = Number(qty);
  if (!Number.isInteger(quantity) || quantity <= 0)
    throw new Error("Quantity must be a positive whole number");

  const { data: menu, error: menuError } = await supabase
    .from("menu_with_availability")
    .select("id, price, available")
    .eq("id", menuId)
    .single();
  if (menuError) throw menuError;
  if (!menu.available) throw new Error("Menu is not available");
  const unitPrice = Number(menu.price);
  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0)
    throw new Error("Selected menu has an invalid price");
  const subTotal = quantity * unitPrice;
  if (!Number.isSafeInteger(subTotal))
    throw new Error("Sales order item total is too large");

  const { error } = await supabase.from("sales_order_items").insert({
    so_id: soId,
    menu_id: menuId,
    qty: quantity,
    unit_price: unitPrice,
    sub_total: subTotal,
    note: typeof note === "string" ? note.trim().slice(0, 500) || null : null,
  });
  if (error) throw error;
};

const deleteDraftOrder = async (id) => {
  const { error: itemError } = await supabase
    .from("sales_order_items")
    .delete()
    .eq("so_id", id);
  if (itemError) throw itemError;
  const { error } = await supabase
    .from("sales_orders")
    .delete()
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw error;
};

export const createPublicOrder = async ({ table, items }) => {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Add at least one menu item");
  if (items.length > 100) throw new Error("Too many menu items");

  const accountId = await getPublicOrderAccount();
  const order = await createSales({
    soDate: new Date().toISOString().slice(0, 10),
    table,
    accountId,
  });

  try {
    for (const item of items) {
      await createSalesItem({
        soId: order.id,
        menuId: item.menu_id,
        qty: item.qty,
        note: item.note,
      });
    }
    return await confirmSalesOrder(order.id);
  } catch (error) {
    await deleteDraftOrder(order.id);
    throw error;
  }
};

export const getPublicOrder = async (soNo) => {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      "id, so_no, so_date, table, status, progress, total_amount, created_at, sales_order_items(id, qty, unit_price, sub_total, note, menu:menu_with_availability!menu_id(name, images))",
    )
    .eq("so_no", soNo)
    .eq("status", "confirmed")
    .single();
  if (error) {
    if (error.code === "PGRST116") throw new Error("Order not found");
    throw error;
  }
  return data;
};
