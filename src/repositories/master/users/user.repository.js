import { supabase } from "@/lib/supabase";

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
