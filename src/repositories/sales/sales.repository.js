import { supabase } from "@/lib/supabase";

export const getSalesPagination = async ({
  page = 1,
  limit = 30,
  search = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("sales_orders")
    .select(
      "id, so_no, so_date, table, status, progress, total_amount, account:account_id(id, name)",
      { count: "exact" },
    );
  if (search)
    query = query.or(`so_no.ilike.%${search}%,status.ilike.%${search}%`);
  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return {
    data,
    totalPages: Math.ceil((count || 0) / limit),
    totalData: count,
  };
};

export const getSalesOrder = async (id) => {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      "id, so_no, so_date, table, status, progress, total_amount, account_id, account:account_id(id, name)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const getSalesOrderItems = async (soId) => {
  const { data, error } = await supabase
    .from("sales_order_items")
    .select(
      "id, so_id, menu_id, qty, unit_price, sub_total, note, menu:menu_id(id, name, price, images, category:menu_category_id(*))",
    )
    .eq("so_id", soId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

export const createSalesOrder = async ({ soDate, table, accountId }) => {
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
      progress: "waiting",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const createSalesOrderItem = async ({ soId, menuId, qty, note }) => {
  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id, price")
    .eq("id", menuId)
    .single();
  if (menuError) throw menuError;
  const unitPrice = Number(menu.price);
  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0)
    throw new Error("Selected menu has an invalid price");
  const quantity = Number(qty);
  const subTotal = quantity * unitPrice;
  if (!Number.isSafeInteger(subTotal))
    throw new Error("Sales order item total is too large");
  const { data, error } = await supabase
    .from("sales_order_items")
    .insert({
      so_id: soId,
      menu_id: menuId,
      qty: quantity,
      unit_price: unitPrice,
      sub_total: subTotal,
      note: note?.trim() || null,
    })
    .select(
      "id, so_id, menu_id, qty, unit_price, sub_total, note, menu:menu_id(id, name, price, images, category:menu_category_id(*))",
    )
    .single();
  if (error) throw error;
  return data;
};

export const deleteSalesOrderItem = async (id) => {
  const { data: item, error: itemError } = await supabase
    .from("sales_order_items")
    .select("id, so_id")
    .eq("id", id)
    .single();
  if (itemError) throw itemError;
  const order = await getSalesOrder(item.so_id);
  if (order.status !== "draft")
    throw new Error("Confirmed sales order cannot be edited");
  const { error } = await supabase
    .from("sales_order_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

const getIngredientUsage = async (items) => {
  const menuIds = [...new Set(items.map((item) => item.menu_id))];
  const { data: recipes, error } = await supabase
    .from("menu_recipes")
    .select("menu_id, ingredient_id, qty")
    .in("menu_id", menuIds);
  if (error) throw error;

  return recipes.reduce((usage, recipe) => {
    const recipeQty = Number(recipe.qty || 0);
    if (!Number.isFinite(recipeQty) || recipeQty < 0)
      throw new Error("A menu recipe has an invalid ingredient quantity");
    const orderQty = items
      .filter((item) => item.menu_id === recipe.menu_id)
      .reduce((sum, item) => sum + Number(item.qty || 0), 0);
    usage[recipe.ingredient_id] =
      (usage[recipe.ingredient_id] || 0) + recipeQty * orderQty;
    return usage;
  }, {});
};

export const confirmSalesOrder = async (id) => {
  const { data: claimedOrder, error: claimError } = await supabase
    .from("sales_orders")
    .update({ status: "processing" })
    .eq("id", id)
    .eq("status", "draft")
    .select("id, account_id")
    .single();
  if (claimError)
    throw new Error("Sales order is already being processed or confirmed");

  const updatedStocks = [];
  let originalBalance;
  let transactionId;
  try {
    if (!claimedOrder.account_id)
      throw new Error("Sales order account is required");
    const items = await getSalesOrderItems(id);
    if (!items.length) throw new Error("Add at least one sales order item");
    const total = items.reduce(
      (sum, item) => sum + Number(item.sub_total || 0),
      0,
    );
    const usageByIngredient = await getIngredientUsage(items);

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("id, initial_balance")
      .eq("id", claimedOrder.account_id)
      .single();
    if (accountError) throw accountError;
    originalBalance = Number(account.initial_balance || 0);

    for (const [ingredientId, quantity] of Object.entries(usageByIngredient)) {
      const { data: ingredient, error: ingredientError } = await supabase
        .from("ingredients")
        .select("id, name, current_stock")
        .eq("id", ingredientId)
        .single();
      if (ingredientError) throw ingredientError;
      const currentStock = Number(ingredient.current_stock || 0);
      if (currentStock < quantity) {
        throw new Error(
          `Insufficient stock for ${ingredient.name || "an ingredient"}: ${currentStock} available, ${quantity} required`,
        );
      }
      const { error: stockError } = await supabase
        .from("ingredients")
        .update({ current_stock: currentStock - quantity })
        .eq("id", ingredientId);
      if (stockError) throw stockError;
      updatedStocks.push({ ingredientId, currentStock });
    }

    const { error: balanceError } = await supabase
      .from("accounts")
      .update({ initial_balance: originalBalance + total })
      .eq("id", account.id);
    if (balanceError) throw balanceError;

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        account_id: account.id,
        type: "sales",
        amount: total,
        ref_id: id,
        ref_type: "sales_order",
      })
      .select("id")
      .single();
    if (transactionError) throw transactionError;
    transactionId = transaction.id;

    const { data, error } = await supabase
      .from("sales_orders")
      .update({ total_amount: total, status: "confirmed" })
      .eq("id", id)
      .eq("status", "processing")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    const rollbackErrors = [];
    for (const stock of updatedStocks.reverse()) {
      const { error: rollbackError } = await supabase
        .from("ingredients")
        .update({ current_stock: stock.currentStock })
        .eq("id", stock.ingredientId);
      if (rollbackError) rollbackErrors.push(rollbackError.message);
    }
    if (originalBalance !== undefined) {
      const { error: rollbackError } = await supabase
        .from("accounts")
        .update({ initial_balance: originalBalance })
        .eq("id", claimedOrder.account_id);
      if (rollbackError) rollbackErrors.push(rollbackError.message);
    }
    if (transactionId) {
      const { error: rollbackError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);
      if (rollbackError) rollbackErrors.push(rollbackError.message);
    }
    const { error: statusError } = await supabase
      .from("sales_orders")
      .update({ status: "draft" })
      .eq("id", id)
      .eq("status", "processing");
    if (statusError) rollbackErrors.push(statusError.message);
    if (rollbackErrors.length) {
      throw new Error(
        `${error.message}; rollback failed: ${rollbackErrors.join("; ")}`,
      );
    }
    throw error;
  }
};

export const deleteSalesOrder = async (id) => {
  const order = await getSalesOrder(id);
  if (order.status === "processing")
    throw new Error("Sales order is currently being processed");
  if (order.status === "confirmed") {
    const items = await getSalesOrderItems(id);
    const usageByIngredient = await getIngredientUsage(items);
    for (const [ingredientId, quantity] of Object.entries(usageByIngredient)) {
      const { data: ingredient, error: ingredientError } = await supabase
        .from("ingredients")
        .select("id, current_stock")
        .eq("id", ingredientId)
        .single();
      if (ingredientError) throw ingredientError;
      const { error: stockError } = await supabase
        .from("ingredients")
        .update({
          current_stock: Number(ingredient.current_stock || 0) + quantity,
        })
        .eq("id", ingredientId);
      if (stockError) throw stockError;
    }
    if (order.account_id) {
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, initial_balance")
        .eq("id", order.account_id)
        .single();
      if (accountError) throw accountError;
      const { error: balanceError } = await supabase
        .from("accounts")
        .update({
          initial_balance:
            Number(account.initial_balance || 0) -
            Number(order.total_amount || 0),
        })
        .eq("id", order.account_id);
      if (balanceError) throw balanceError;
    }
  }

  const { error: itemError } = await supabase
    .from("sales_order_items")
    .delete()
    .eq("so_id", id);
  if (itemError) throw itemError;
  const { error: transactionError } = await supabase
    .from("transactions")
    .delete()
    .eq("ref_id", id)
    .eq("ref_type", "sales_order");
  if (transactionError) throw transactionError;
  const { error } = await supabase.from("sales_orders").delete().eq("id", id);
  if (error) throw error;
};
