import { supabase } from "@/lib/supabase";

export const getIngredientPagination = async ({
  page = 1,
  limit = 30,
  search = "",
  category = "",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from("ingredients")
    .select("id,name,images,unit,current_stock,category:category_id(*)", {
      count: "exact",
    });
  if (search) query = query.or(`name.ilike.%${search}%`);

  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error) throw error;

    const formattedData = data.map((item) => ({
    ...item,
    category_name: item.category?.name ?? null,
  }));
  return {
    data: formattedData,
    totalData: count,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const createData = async (body) => {
  const { data, error } = await supabase
    .from("ingredients")
    .insert(body)
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const getById = async (id) => {
  const { data, error } = await supabase
    .from("ingredients")
    .select("*, category:category_id(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const updateData = async (id, body) => {
  const { data, error } = await supabase
    .from("ingredients")
    .update(body)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const deleteData = async (id) => {
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) throw error;
};
