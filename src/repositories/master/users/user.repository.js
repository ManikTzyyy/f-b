import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users")
    .select("*, role:role_id(id, name)")
    .eq("username", username)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

export const getUser = async ({ page = 1, limit = 30, search = "" }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("users")
    .select(`id, username, name, role:role_id(*)`, { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    users: data,
    totalData: count,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createUser = async ({ username, name, password, role_id }) => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      name,
      password: await bcrypt.hash(password, 10),
      role_id,
    })
    .select("id, username, name, role:role_id(id, name)")
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (id, { username, name, password, role_id }) => {
  const updates = { username, name, role_id };
  if (password) updates.password = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select("id, username, name, role:role_id(id, name)")
    .single();

  if (error) throw error;
  return data;
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
};
