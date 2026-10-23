"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatPrice = (value) =>
  value === "" ? "" : `Rp ${Number(value).toLocaleString("id-ID")}`;

export default function EditMenuPage({ id }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: "",
    menu_category_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const selectedCategoryName =
    categories.find((category) => String(category.id) === form.menu_category_id)
      ?.name || "";

  useEffect(() => {
    let active = true;
    fetch("/api/master/menu-category")
      .then(async (response) => {
        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch categories");
        }
        if (active) setCategories(responseData.data || []);
      })
      .catch((error) =>
        toast.error(error.message || "Failed to fetch categories"),
      );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    fetch(`/api/product/menu?id=${id}`)
      .then((response) => response.json())
      .then((responseData) => {
        if (!responseData.success) throw new Error(responseData.message);
        const menu = responseData.data;
        setForm({
          name: menu.name || "",
          description: menu.description || "",
          price: menu.price ?? "",
          images: menu.images || "",
          menu_category_id: menu.menu_category?.id || "",
        });
      })
      .catch((error) => toast.error(error.message || "Failed to fetch menu"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/product/menu?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to update menu");
      toast.success("Menu updated");
      router.push(`/product/menu/${id}`);
    } catch (error) {
      toast.error(error.message || "Failed to update menu");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <>
      <TableTitle title="Edit Menu" desc="Ubah data menu" />
      <form onSubmit={handleSubmit} className="max-w-xl pt-4">
        <FieldGroup>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={form.menu_category_id}
              onValueChange={(value) =>
                setForm({ ...form, menu_category_id: value })
              }>
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
            <FieldLabel>Name</FieldLabel>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <textarea
              className="border-input min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <Input
              inputMode="numeric"
              value={formatPrice(form.price)}
              onChange={(event) =>
                setForm({
                  ...form,
                  price: event.target.value.replace(/\D/g, ""),
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Image URL</FieldLabel>
            <Input
              type="url"
              value={form.images}
              onChange={(event) =>
                setForm({ ...form, images: event.target.value })
              }
            />
            {form.images && (
              <img
                src={form.images}
                alt="Menu preview"
                className="mt-2 h-40 w-40 rounded-md border object-cover"
              />
            )}
          </Field>
        </FieldGroup>
        <div className="flex gap-2 pt-5">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !form.name.trim()}>
            {saving ? <Spinner /> : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
