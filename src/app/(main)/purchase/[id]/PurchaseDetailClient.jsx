"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
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

import { Trash, SquareMinus, SquarePlus } from "lucide-react";

export default function PurchaseDetailPage({ id }) {
  const router = useRouter();
  const [purchase, setPurchase] = useState(null);
  const [items, setItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ qty: "", unit_cost: "" });

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.sub_total || 0), 0),
    [items],
  );

  const loadData = async () => {
    const [purchaseResponse, itemResponse] = await Promise.all([
      fetch(`/api/purchase?id=${id}`),
      fetch(`/api/purchase/item?po_id=${id}`),
    ]);
    const purchaseData = await purchaseResponse.json();
    const itemData = await itemResponse.json();
    if (!purchaseResponse.ok || !purchaseData.success)
      throw new Error(purchaseData.message || "Failed to fetch purchase");
    if (!itemResponse.ok || !itemData.success)
      throw new Error(itemData.message || "Failed to fetch purchase items");
    setPurchase(purchaseData.data);
    setItems(itemData.data || []);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        await loadData();
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch purchase");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!showResults || purchase?.status !== "draft") return;
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/product/ingredient?page=1&limit=30&search=${encodeURIComponent(ingredientSearch)}`,
        );
        const responseData = await response.json();
        if (!response.ok || !responseData.success)
          throw new Error(
            responseData.message || "Failed to search ingredients",
          );
        setIngredients(responseData.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to search ingredients");
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [ingredientSearch, showResults, purchase?.status]);

  const addItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/purchase/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          po_id: id,
          ingredient_id: selectedIngredient?.id,
          ...form,
        }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to add item");
      setItems((current) => [...current, responseData.data]);
      setSelectedIngredient(null);
      setIngredientSearch("");
      setForm({ qty: "", unit_cost: "" });
      setShowResults(false);
    } catch (error) {
      toast.error(error.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item) => {
    try {
      const response = await fetch(`/api/purchase/item?id=${item.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete item");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const confirm = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/purchase?id=${id}`, {
        method: "PATCH",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to confirm purchase");
      setPurchase(responseData.data);
      toast.success("Purchase confirmed");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to confirm purchase");
    } finally {
      setSaving(false);
    }
  };

  const deletePurchase = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/purchase?id=${id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete purchase");
      router.push("/purchase");
    } catch (error) {
      toast.error(error.message || "Failed to delete purchase");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  if (!purchase) return <div className="p-4">Purchase not found</div>;
  const locked = purchase.status !== "draft";

  return (
    <>
      <div className="flex justify-between">
        <TableTitle title={purchase.po_no} desc="Detail purchase order" />
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className=" space-y-6 pt-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">PO No</p>
              <p className="font-semibold">{purchase.po_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{purchase.po_date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p>{purchase.supplier?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold uppercase">{purchase.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p className="text-lg">{purchase.account?.name || ""}</p>
            </div>
          </div>
        </div>
        {!locked && (
          <form
            onSubmit={addItem}
            className="flex flex-wrap items-end gap-2 rounded-lg border p-4"
          >
            <div className="relative min-w-64">
              <label className="mb-1 block text-sm font-medium">
                Ingredient
              </label>
              <Input
                placeholder="Search ingredient..."
                value={ingredientSearch}
                onFocus={() => setShowResults(true)}
                onChange={(event) => {
                  setIngredientSearch(event.target.value);
                  setSelectedIngredient(null);
                  setShowResults(true);
                }}
                required
              />
              {showResults && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {ingredients.map((ingredient) => (
                    <button
                      type="button"
                      key={ingredient.id}
                      className="flex w-full items-center gap-2 p-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setIngredientSearch(ingredient.name);
                        setShowResults(false);
                      }}
                    >
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">
                        ({ingredient.unit || "-"})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium ">Qty</label>
              <Input
                className={"w-20"}
                placeholder="0"
                type="number"
                min="1"
                value={form.qty}
                onChange={(event) =>
                  setForm({ ...form, qty: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Unit cost
              </label>
              <Input
                placeholder="0"
                type="number"
                min="0"
                value={form.unit_cost}
                onChange={(event) =>
                  setForm({ ...form, unit_cost: event.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={saving || !selectedIngredient}
            >
              {saving ? <Spinner /> : <SquarePlus />}
            </Button>
          </form>
        )}
        <div className="overflow-hidden rounded-lg border">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No purchase items.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b p-3 last:border-b-0"
              >
                <span>
                  {item.ingredient?.name || "-"}{" "}
                  <span className="text-muted-foreground">
                    ({item.qty} x Rp{" "}
                    {Number(item.unit_cost || 0).toLocaleString("id-ID")})
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  Rp {Number(item.sub_total || 0).toLocaleString("id-ID")}
                  {!locked && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item)}
                    >
                      <SquareMinus />
                    </Button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <span className="text-lg font-semibold">Grand total</span>
          <span className="text-lg font-semibold">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive">
                  <Trash />
                </Button>
              }
            >
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete purchase?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deletePurchase}>
                  {deleting ? <Spinner /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {!locked && (
            <Button disabled={saving || items.length === 0} onClick={confirm}>
              {saving ? <Spinner /> : "Confirm order"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
