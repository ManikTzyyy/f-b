"use client";

import { useState, useEffect } from "react";
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

export default function CreateMenuPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: "",
    menu_category_id: "",
  });
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/product/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to create menu");
      }
      toast.success("Menu created");
      router.push(`/product/menu/${responseData.data.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to create menu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TableTitle title="Create Menu" desc="Tambah data menu" />
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
            <FieldLabel htmlFor="menu-name">Name</FieldLabel>
            <Input
              id="menu-name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="menu-description">Description</FieldLabel>
            <textarea
              id="menu-description"
              className="border-input min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="menu-price">Price</FieldLabel>
            <Input
              id="menu-price"
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
            <FieldLabel htmlFor="menu-image">Image URL</FieldLabel>
            <Input
              id="menu-image"
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
            {saving ? <Spinner /> : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
}
