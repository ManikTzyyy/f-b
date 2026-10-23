import { supabase } from "@/lib/supabase";

export const getMenuPagination = async ({
  page = 1,
  limit = 30,
  search = "",
  category = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("menus")
    .select("id, name, description, price, images", { count: "exact" });
  if (search) query = query.ilike("name", `%${search}%`);
  if (category && category !== "all") {
    query = query.eq("menu_category_id", category);
  }
  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return {
    data,
    totalData: count,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const getById = async (id) => {
  const { data, error } = await supabase
    .from("menus")
    .select(
      "id, name, description, price, images, menu_category:menu_category_id(*)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createData = async (body) => {
  const { data, error } = await supabase
    .from("menus")
    .insert(body)
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const updateData = async (id, body) => {
  const { data, error } = await supabase
    .from("menus")
    .update(body)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("menus").delete().eq("id", id);
  if (error) throw error;
};

export const getRecipes = async (menuId) => {
  const { data, error } = await supabase
    .from("menu_recipes")
    .select(
      "id, menu_id, ingredient_id, qty, ingredient:ingredient_id(id, name, unit, images)",
    )
    .eq("menu_id", menuId)
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

export const createRecipe = async (body) => {
  const { data, error } = await supabase
    .from("menu_recipes")
    .insert(body)
    .select(
      "id, menu_id, ingredient_id, qty, ingredient:ingredient_id(id, name, unit, images)",
    )
    .single();
  if (error) throw error;
  return data;
};

export const deleteRecipe = async (id) => {
  const { error } = await supabase.from("menu_recipes").delete().eq("id", id);
  if (error) throw error;
};
