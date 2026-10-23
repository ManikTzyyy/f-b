"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { SquareMinus, SquarePlus, Pen, Trash } from "lucide-react";
import { LabelInfo } from "@/components/layout/LabelInfo";

export default function MenuDetailPage({ id }) {
  const router = useRouter();
  const [menu, setMenu] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [showIngredientResults, setShowIngredientResults] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeForm, setRecipeForm] = useState({ ingredient_id: "", qty: "" });
  const ingredientSearchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        ingredientSearchRef.current &&
        !ingredientSearchRef.current.contains(event.target)
      ) {
        setShowIngredientResults(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [menuResponse, ingredientResponse, recipeResponse] =
          await Promise.all([
            fetch(`/api/product/menu?id=${id}`),
            fetch("/api/product/ingredient?page=1&limit=30&search="),
            fetch(`/api/product/menu/recipe?menu_id=${id}`),
          ]);
        const menuData = await menuResponse.json();
        const ingredientData = await ingredientResponse.json();
        const recipeData = await recipeResponse.json();
        if (!menuResponse.ok || !menuData.success)
          throw new Error(menuData.message || "Failed to fetch menu");
        if (!ingredientResponse.ok || !ingredientData.success)
          throw new Error(
            ingredientData.message || "Failed to fetch ingredients",
          );
        if (!recipeResponse.ok || !recipeData.success)
          throw new Error(recipeData.message || "Failed to fetch recipes");
        if (active) {
          setMenu(menuData.data);
          setIngredients(ingredientData.data || []);
          setRecipes(recipeData.data || []);
        }
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch menu");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) loadData();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoadingIngredients(true);
      try {
        const response = await fetch(
          `/api/product/ingredient?page=1&limit=30&search=${encodeURIComponent(ingredientSearch)}`,
        );
        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(
            responseData.message || "Failed to search ingredients",
          );
        }
        setIngredients(responseData.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to search ingredients");
      } finally {
        setLoadingIngredients(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [ingredientSearch]);

  const addRecipe = async (event) => {
    event.preventDefault();
    setSavingRecipe(true);
    try {
      const response = await fetch("/api/product/menu/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: id, ...recipeForm }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to add recipe");
      setRecipes((current) => [...current, responseData.data]);
      setRecipeForm({ ingredient_id: "", qty: "" });
      setIngredientSearch("");
      setShowIngredientResults(false);
      toast.success("Recipe added");
    } catch (error) {
      toast.error(error.message || "Failed to add recipe");
    } finally {
      setSavingRecipe(false);
    }
  };

  const removeRecipe = async (recipe) => {
    setDeletingRecipe(recipe.id);
    try {
      const response = await fetch(`/api/product/menu/recipe?id=${recipe.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete recipe");
      setRecipes((current) => current.filter((item) => item.id !== recipe.id));
      toast.success("Recipe deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete recipe");
    } finally {
      setDeletingRecipe(null);
    }
  };

  const deleteMenu = async () => {
    try {
      const response = await fetch(`/api/product/menu?id=${id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete menu");
      toast.success("Menu deleted");
      router.push("/product/menu");
    } catch (error) {
      toast.error(error.message || "Failed to delete menu");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!menu) return <div className="p-4">Menu not found</div>;

  const price =
    menu.price == null ? "-" : Number(menu.price).toLocaleString("id-ID");

  return (
    <div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <div className="flex justify-end gap-2 ">
          <Button
            className="bg-amber-300 hover:bg-amber-500 w-10 h-10"
            type="button"
            onClick={() => router.push(`/product/menu/edit/${id}`)}
          >
            <Pen />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  className={" w-10 h-10"}
                >
                  <Trash />
                </Button>
              }
            ></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Menu?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteMenu}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {/* content */}
      <div
        className={`flex gap-10 flex-wrap p-4 my-2 rounded-lg ${!menu.available && "bg-red-50" }`}
      >
        <div className="w-80 h-80 overflow-hidden rounded-lg">
          <img
            className="object-cover w-full h-full"
            src={menu.images}
            alt={menu.name}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 h-fit">
          <LabelInfo label={"Menu Name"} value={menu.name} />
          <LabelInfo label={"Price"} value={`Rp. ${price}`} />
          <div className="max-w-96">
            <LabelInfo label={"Description"} value={menu.description} />
          </div>
          <LabelInfo label={"Category"} value={menu.menu_category?.name} />
          <LabelInfo
            label={"Status"}
            value={menu.available ? "availabel" : "not available"}
          />
        </div>
      </div>

      {/* footer */}

      <div className="mt-12 border-t border-stone-300 p-4">
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Menu Recipes
        </h2>
        <form
          onSubmit={addRecipe}
          className="mb-4 flex flex-wrap items-center gap-2"
        >
          <div ref={ingredientSearchRef} className="relative min-w-56">
            <label className="mb-1 block text-sm font-medium">Ingredient</label>
            <Input
              className=""
              placeholder="Search ingredient..."
              value={ingredientSearch}
              onFocus={() => setShowIngredientResults(true)}
              onChange={(event) => {
                setIngredientSearch(event.target.value);
                setShowIngredientResults(true);
                setRecipeForm({ ...recipeForm, ingredient_id: "" });
              }}
            />
            {showIngredientResults && (
              <div className="absolute left-0 bottom-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                {loadingIngredients ? (
                  <div className="flex justify-center p-3">
                    <Spinner />
                  </div>
                ) : ingredients.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No ingredient found
                  </div>
                ) : (
                  ingredients.slice(0, 30).map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      className="flex w-full items-center gap-2 p-2 text-left text-sm hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setIngredientSearch(ingredient.name);
                        setRecipeForm({
                          ...recipeForm,
                          ingredient_id: String(ingredient.id),
                        });
                        setShowIngredientResults(false);
                      }}
                    >
                      <span className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
                        {ingredient.images && (
                          <img
                            src={ingredient.images}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      <span>{ingredient.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Qty</label>
            <Input
              type="number"
              className="w-16"
              step="0.01"
              min="0"
              placeholder="qty"
              value={recipeForm.qty}
              onChange={(event) =>
                setRecipeForm({ ...recipeForm, qty: event.target.value })
              }
              required
            />
          </div>
          <div className="self-end">
            <Button
            variant="outline"
              type="submit"
              disabled={savingRecipe || !recipeForm.ingredient_id}
            >
              {savingRecipe ? <Spinner /> : <SquarePlus />}
            </Button>
          </div>
        </form>
        <div className="overflow-hidden rounded-md border">
          {recipes.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No ingredients added.
            </p>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between border-b p-3 last:border-b-0"
              >
                <span className="flex items-center gap-3">
                  <span className="h-10 w-10 overflow-hidden rounded bg-muted">
                    {recipe.ingredient?.images && (
                      <img
                        src={recipe.ingredient.images}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span>
                    <span className="font-bold mr-2">{recipe.qty ?? "-"}</span>
                    {recipe.ingredient?.name || "-"} (
                    {recipe.ingredient?.unit || "-"})
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => removeRecipe(recipe)}
                  >
                    {deletingRecipe === recipe.id ? (
                      <Spinner />
                    ) : (
                      <SquareMinus />
                    )}
                  </Button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
