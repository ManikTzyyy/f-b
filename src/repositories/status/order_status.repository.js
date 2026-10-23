import { supabase } from "@/lib/supabase";

export const getKitchenOrders = async (page = 1, limit = 10, progress = "") => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("sales_orders").select(
    `
      id,
      so_no,
      so_date,
      table,
      status,
      progress,
      created_at,
      total_amount,
      sales_order_items (
        id,
        qty,
        note,
        unit_price,
        sub_total,
        menu:menu_id (
          name,
          images
        )
      )
    `,
    { count: "exact" },
  );

  query = query.eq("status", "confirmed");

  if (progress && progress !== "all") {
    query = query.eq("progress", progress);
  } else {
    query = query.neq("progress", "delivered");
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const [pendingRes, cookingRes, readyRes, deliveredRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("progress", "pending"),
    supabase
      .from("sales_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("progress", "cooking"),
    supabase
      .from("sales_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("progress", "ready"),
    supabase
      .from("sales_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed")
      .eq("progress", "delivered"),
  ]);

  return {
    data: data,
    totalData: count,
    totalPages: Math.ceil((count || 0) / limit),
    counts: {
      pending: pendingRes.count || 0,
      cooking: cookingRes.count || 0,
      ready: readyRes.count || 0,
      delivered: deliveredRes.count || 0,
    },
  };
};

export const updateKitchenOrderProgress = async (id, progress) => {
  const { data, error } = await supabase
    .from("sales_orders")
    .update({ progress })
    .eq("id", id)
    .eq("status", "confirmed")
    .select("id, progress")
    .single();
  if (error) throw error;
  return data;
};
