import { supabase } from "@/lib/supabase";

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getRolePagination = async ({
  page = 1,
  limit = 30,
  search = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("roles").select(`id, name`, { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    data: data,
    totalData: count,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createData = async ({ name }) => {
  const { data, error } = await supabase
    .from("roles")
    .insert({
      name,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const updateData = async (id, { name }) => {
  const updates = { name };

  const { data, error } = await supabase
    .from("roles")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
};
