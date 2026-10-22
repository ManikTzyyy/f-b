import { supabase } from "@/lib/supabase";

export const getPurchasePagination = async ({
  page = 1,
  limit = 30,
  search = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("purchases")
    .select(
      "id, po_no, po_date, supplier_id, total_amount, status, supplier:supplier_id(id, name)",
      { count: "exact" },
    );
  if (search)
    query = query.or(`po_no.ilike.%${search}%,status.ilike.%${search}%`);
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

export const getPurchase = async (id) => {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      "id, po_no, po_date, supplier_id, total_amount, status, account:account_id(id,name), supplier:supplier_id(id, name)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const getPurchaseItems = async (poId) => {
  const { data, error } = await supabase
    .from("purchase_items")
    .select(
      "id, po_id, ingredient_id, qty, unit_cost, sub_total, ingredient:ingredient_id(id, name, unit, images)",
    )
    .eq("po_id", poId)
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

export const createPurchase = async ({ poDate, supplierId, accountId }) => {
  const { data: config, error: configError } = await supabase
    .from("config_no")
    .select("id, count")
    .eq("id", 2)
    .single();
  if (configError) throw configError;
  const nextCount = (config.count || 0) + 1;
  const { error: updateError } = await supabase
    .from("config_no")
    .update({ count: nextCount })
    .eq("id", 2);
  if (updateError) throw updateError;
  const poNo = `PO-${String(nextCount).padStart(5, "0")}`;
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      po_no: poNo,
      po_date: poDate,
      supplier_id: Number(supplierId),
      account_id: accountId,
      total_amount: null,
      status: "draft",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const createPurchaseItem = async ({
  poId,
  ingredientId,
  qty,
  unitCost,
}) => {
  const subTotal = Number(qty) * Number(unitCost);
  const { data, error } = await supabase
    .from("purchase_items")
    .insert({
      po_id: poId,
      ingredient_id: ingredientId,
      qty: Number(qty),
      unit_cost: Number(unitCost),
      sub_total: subTotal,
    })
    .select(
      "id, po_id, ingredient_id, qty, unit_cost, sub_total, ingredient:ingredient_id(id, name, unit, images)",
    )
    .single();
  if (error) throw error;
  return data;
};

export const deletePurchaseItem = async (id) => {
  const { error } = await supabase.from("purchase_items").delete().eq("id", id);
  if (error) throw error;
};

export const confirmPurchase = async (id) => {
  const purchase = await getPurchase(id);

  if (purchase.status !== "draft")
    throw new Error("Purchase is already confirmed");
  if (!purchase.account.id)
    throw new Error("Purchase account is required");
  const items = await getPurchaseItems(id);
  if (!items.length) throw new Error("Add at least one purchase item");
  const total = items.reduce(
    (sum, item) => sum + Number(item.sub_total || 0),
    0,
  );

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, initial_balance")
    .eq("id", purchase.account.id)
    .single();
  if (accountError) throw accountError;

  const stockByIngredient = items.reduce((stocks, item) => {
    stocks[item.ingredient_id] =
      (stocks[item.ingredient_id] || 0) + Number(item.qty || 0);
    return stocks;
  }, {});
  for (const [ingredientId, quantity] of Object.entries(stockByIngredient)) {
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

  const { error: balanceError } = await supabase
    .from("accounts")
    .update({ initial_balance: Number(account.initial_balance || 0) - total })
    .eq("id", purchase.account.id);
  if (balanceError) throw balanceError;

  const { data, error } = await supabase
    .from("purchases")
    .update({ total_amount: total, status: "confirmed" })
    .eq("id", id)
    .eq("status", "draft")
    .select("*")
    .single();
  if (error) throw error;
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      account_id: purchase.account.id || null,
      type: "purchase",
      amount: total,
      ref_id: id,
      ref_type: "purchase",
    });
  if (transactionError) throw transactionError;
  return data;
};

export const deletePurchase = async (id) => {
  const purchase = await getPurchase(id);
  if (purchase.status === "confirmed") {
    const items = await getPurchaseItems(id);
    const stockByIngredient = items.reduce((stocks, item) => {
      stocks[item.ingredient_id] =
        (stocks[item.ingredient_id] || 0) + Number(item.qty || 0);
      return stocks;
    }, {});
    for (const [ingredientId, quantity] of Object.entries(stockByIngredient)) {
      const { data: ingredient, error: ingredientError } = await supabase
        .from("ingredients")
        .select("id, current_stock")
        .eq("id", ingredientId)
        .single();
      if (ingredientError) throw ingredientError;
      const { error: stockError } = await supabase
        .from("ingredients")
        .update({
          current_stock: Number(ingredient.current_stock || 0) - quantity,
        })
        .eq("id", ingredientId);
      if (stockError) throw stockError;
    }
    if (purchase.account.id) {
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, initial_balance")
        .eq("id", purchase.account.id)
        .single();
      if (accountError) throw accountError;
      const { error: balanceError } = await supabase
        .from("accounts")
        .update({
          initial_balance:
            Number(account.initial_balance || 0) +
            Number(purchase.total_amount || 0),
        })
        .eq("id", purchase.account.id);
      if (balanceError) throw balanceError;
    }
  }
  const { error: itemError } = await supabase
    .from("purchase_items")
    .delete()
    .eq("po_id", id);
  if (itemError) throw itemError;
  const { error: transactionError } = await supabase
    .from("transactions")
    .delete()
    .eq("ref_id", id)
    .eq("ref_type", "purchase");
  if (transactionError) throw transactionError;
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) throw error;
};
