import { supabase } from "@/lib/supabase";

export const getSupplierPagination = async ({ page = 1, limit = 30, search = "" }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase.from("supplier").select("id, name, phone, address", { count: "exact" });
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, error, count } = await query.range(from, to).order("created_at", { ascending: false });
  if (error) throw error;
  return { data, totalData: count, totalPages: Math.ceil((count || 0) / limit) };
};

export const createData = async (body) => {
  const { data, error } = await supabase.from("supplier").insert(body).select("*").single();
  if (error) throw error;
  return data;
};

export const updateData = async (id, body) => {
  const { data, error } = await supabase.from("supplier").update(body).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("supplier").delete().eq("id", id);
  if (error) throw error;
};