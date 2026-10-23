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
import { SquareMinus, Trash, SquarePlus } from "lucide-react";

export default function SalesDetailClient({ id }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ qty: "1", note: "" });

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.sub_total || 0), 0),
    [items],
  );

  const loadData = async () => {
    const [orderResponse, itemResponse] = await Promise.all([
      fetch(`/api/sales?id=${id}`),
      fetch(`/api/sales/item?so_id=${id}`),
    ]);
    const [orderData, itemData] = await Promise.all([
      orderResponse.json(),
      itemResponse.json(),
    ]);
    if (!orderResponse.ok || !orderData.success)
      throw new Error(orderData.message || "Failed to fetch sales order");
    if (!itemResponse.ok || !itemData.success)
      throw new Error(itemData.message || "Failed to fetch sales order items");
    setOrder(orderData.data);
    setItems(itemData.data || []);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        await loadData();
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch sales order");
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
    if (!showResults || order?.status !== "draft") return;
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/product/menu?page=1&limit=30&search=${encodeURIComponent(menuSearch)}`,
        );
        const responseData = await response.json();
        if (!response.ok || !responseData.success)
          throw new Error(responseData.message || "Failed to search menus");
        setMenus(responseData.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to search menus");
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [menuSearch, showResults, order?.status]);

  const addItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/sales/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          so_id: id,
          menu_id: selectedMenu?.id,
          ...form,
        }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to add menu");
      setItems((current) => [...current, responseData.data]);
      setSelectedMenu(null);
      setMenuSearch("");
      setForm({ qty: "1", note: "" });
      setShowResults(false);
    } catch (error) {
      toast.error(error.message || "Failed to add menu");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item) => {
    try {
      const response = await fetch(`/api/sales/item?id=${item.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete menu");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      toast.error(error.message || "Failed to delete menu");
    }
  };

  const confirm = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/sales?id=${id}`, { method: "PATCH" });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(
          responseData.message || "Failed to confirm sales order",
        );
      await loadData();
      toast.success("Sales order confirmed");
    } catch (error) {
      toast.error(error.message || "Failed to confirm sales order");
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to delete sales order");
      router.push("/sales");
    } catch (error) {
      toast.error(error.message || "Failed to delete sales order");
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
  if (!order) return <div className="p-4">Sales order not found</div>;
  const locked = order.status !== "draft";

  return (
    <>
      <div className="flex justify-between">
        <TableTitle title={order.so_no} desc="Detail sales order" />
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="space-y-6 pt-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">SO No</p>
              <p className="font-semibold">{order.so_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{order.so_date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Table</p>
              <p>{order.table || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account</p>
              <p>{order.account?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold uppercase">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-semibold uppercase">{order.progress || "-"}</p>
            </div>
          </div>
        </div>

        {!locked && (
          <form
            onSubmit={addItem}
            className="flex flex-wrap items-end gap-2 rounded-lg border p-4">
            <div className="relative min-w-64">
              <label className="mb-1 block text-sm font-medium">Menu</label>
              <Input
                placeholder="Search menu..."
                value={menuSearch}
                onFocus={() => setShowResults(true)}
                onChange={(event) => {
                  setMenuSearch(event.target.value);
                  setSelectedMenu(null);
                  setShowResults(true);
                }}
                required
              />
              {showResults && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {menus.map((menu) => (
                    <button
                      type="button"
                      key={menu.id}
                      className="flex w-full items-center justify-between gap-2 p-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setSelectedMenu(menu);
                        setMenuSearch(menu.name);
                        setShowResults(false);
                      }}>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-lg overflow-hidden">
                          <img
                            src={menu.images}
                            alt={menu.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span>{menu.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Rp {Number(menu.price || 0).toLocaleString("id-ID")}
                      </span>
                    </button>
                  ))}
                  {menus.length === 0 && (
                    <p className="p-2 text-sm text-muted-foreground">
                      No menus found.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Qty</label>
              <Input
                className="w-24"
                type="number"
                min="1"
                step="1"
                value={form.qty}
                onChange={(event) =>
                  setForm({ ...form, qty: event.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Unit price
              </label>
              <Input
                className="w-36"
                value={
                  selectedMenu
                    ? `Rp ${Number(selectedMenu.price || 0).toLocaleString("id-ID")}`
                    : ""
                }
                placeholder="Auto from menu"
                readOnly
                required
              />
            </div>
            <div className="min-w-48 flex-1">
              <label className="mb-1 block text-sm font-medium">Note</label>
              <Input
                value={form.note}
                onChange={(event) =>
                  setForm({ ...form, note: event.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={saving || !selectedMenu}>
              {saving ? <Spinner /> : <SquarePlus />}
            </Button>
          </form>
        )}

        <div className="overflow-hidden rounded-lg border">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No sales order items.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b p-3 last:border-b-0">
                <div className="flex gap-5">
                  <div className="h-20 w-20 rounded-lg overflow-hidden">
                    <img
                      src={item.menu?.images}
                      alt={item.menu?.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.menu?.name || "-"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} x Rp{" "}
                      {Number(item.unit_price || 0).toLocaleString("id-ID")}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-3 whitespace-nowrap">
                  Rp {Number(item.sub_total || 0).toLocaleString("id-ID")}
                  {!locked && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item)}>
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
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete sales order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                  {order.status === "confirmed" &&
                    " Stock and account balance will be reversed."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteOrder}>
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
