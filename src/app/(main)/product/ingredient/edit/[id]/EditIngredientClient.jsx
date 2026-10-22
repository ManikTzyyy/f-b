"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export default function EditIngredientPage({ id }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category_id: "",
    name: "",
    unit: "",
    current_stock: "",
    images: "",
  });
  const selectedCategoryName =
    categories.find((category) => String(category.id) === form.category_id)
      ?.name || "";

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [ingredientResponse, categoryResponse] = await Promise.all([
          fetch(`/api/product/ingredient?id=${id}`),
          fetch("/api/master/category"),
        ]);
        const ingredientData = await ingredientResponse.json();
        const categoryData = await categoryResponse.json();
        if (!ingredientResponse.ok || !ingredientData.success) {
          throw new Error(
            ingredientData.message || "Failed to fetch ingredient",
          );
        }
        if (!categoryResponse.ok || !categoryData.success) {
          throw new Error(categoryData.message || "Failed to fetch categories");
        }
        if (active) {
          const ingredient = ingredientData.data;
          setForm({
            category_id: ingredient.category_id
              ? String(ingredient.category_id)
              : "",
            name: ingredient.name || "",
            unit: ingredient.unit || "",
            current_stock: ingredient.current_stock ?? "",
            images: ingredient.images || "",
          });
          setCategories(categoryData.data || []);
        }
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch ingredient");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) loadData();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/product/ingredient?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to update ingredient");
      }
      toast.success("Ingredient updated");
      router.push(`/product/ingredient/${id}`);
    } catch (error) {
      toast.error(error.message || "Failed to update ingredient");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="w-full min-h-40 flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <TableTitle title="Edit Ingredient" desc="Ubah data bahan" />
      <form onSubmit={handleSubmit} className="max-w-xl pt-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={form.category_id}
              onValueChange={(value) =>
                setForm({ ...form, category_id: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category">
                  {selectedCategoryName || "Select category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-name">Name</FieldLabel>
            <Input
              id="ingredient-name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-unit">Unit</FieldLabel>
            <Input
              id="ingredient-unit"
              value={form.unit}
              onChange={(event) =>
                setForm({ ...form, unit: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-stock">Current stock</FieldLabel>
            <Input
              id="ingredient-stock"
              type="number"
              value={form.current_stock}
              onChange={(event) =>
                setForm({ ...form, current_stock: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-image">Image URL</FieldLabel>
            <Input
              id="ingredient-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.images}
              onChange={(event) =>
                setForm({ ...form, images: event.target.value })
              }
            />
            {form.images && (
              <img
                src={form.images}
                alt="Ingredient preview"
                className="mt-2 h-40 w-40 rounded-md border object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                onLoad={(event) => {
                  event.currentTarget.style.display = "block";
                }}
              />
            )}
          </Field>
        </FieldGroup>
        <div className="flex gap-2 pt-5">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !form.name.trim()}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
