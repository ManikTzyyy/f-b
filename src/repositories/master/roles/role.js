import { supabase } from "@/lib/supabase";

export const getRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};