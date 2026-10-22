import { supabase } from "@/lib/supabase";

export const getAccountPagination = async ({ page = 1, limit = 30, search = "" }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase.from("accounts").select("id, name, type, initial_balance", { count: "exact" });
  if (search) query = query.or(`name.ilike.%${search}%,type.ilike.%${search}%`);
  const { data, error, count } = await query.range(from, to).order("created_at", { ascending: false });
  if (error) throw error;
  return { data, totalData: count, totalPages: Math.ceil((count || 0) / limit) };
};

export const createData = async (body) => {
  const { data, error } = await supabase.from("accounts").insert(body).select("*").single();
  if (error) throw error;
  return data;
};

export const updateData = async (id, body) => {
  const { data, error } = await supabase.from("accounts").update(body).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
};