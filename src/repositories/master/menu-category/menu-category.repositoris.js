import { supabase } from "@/lib/supabase";

export const getMenuCategory = async ({ page = 1, limit = 30, search = "" }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase.from("menu_categories").select("id, name", { count: "exact" });
  if (search) query = query.ilike("name", `%${search}%`);
  const { data, error, count } = await query.range(from, to).order("created_at", { ascending: false });
  if (error) throw error;
  return { data, totalData: count, totalPages: Math.ceil((count || 0) / limit) };
};

export const createData = async ({ name }) => {
  const { data, error } = await supabase.from("menu_categories").insert({ name }).select("*").single();
  if (error) throw error;
  return data;
};

export const updateData = async (id, { name }) => {
  const { data, error } = await supabase.from("menu_categories").update({ name }).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) throw error;
};