"use client";

import TableTitle from "@/components/layout/TableTitle";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Minus, Plus, CalendarArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PublicMenu() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [category, setCategory] = useState([]);
  const [menuById, setMenuById] = useState({});
  const [orderOpen, setOrderOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [notes, setNotes] = useState({});
  const [table, setTable] = useState("");

  useEffect(() => {
    setTable(new URLSearchParams(window.location.search).get("id") || "");
  }, []);

  const [quantities, setQuantities] = useState({});
  const updateQuantity = (productId, amount) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + amount),
    }));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let active = true;
    const loadCategory = async () => {
      try {
        const res = await fetch(`/api/public/menu-category`);
        const responseData = await res.json();
        if (!res.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch categories");
        }
        if (active) {
          setCategory(responseData.data || []);
        }
      } catch (error) {
        if (active)
          toast.error("Failed to fetch category", {
            description: error.message,
          });
      }
    };
    loadCategory();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/public/menu?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}${
            categoryFilter === "all"
              ? ""
              : `&category=${encodeURIComponent(categoryFilter)}`
          }`,
        );
        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch menus");
        }
        if (active) {
          setData(responseData.data);
          setMenuById((current) => ({
            ...current,
            ...Object.fromEntries(
              (responseData.data || []).map((item) => [item.id, item]),
            ),
          }));
          setTotalPages(responseData.totalPages || 1);
        }
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch menus");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [page, limit, debouncedSearch, categoryFilter]);

  const selectedItems = Object.entries(quantities)
    .filter(([id, quantity]) => quantity > 0 && menuById[id])
    .map(([id, quantity]) => ({
      ...menuById[id],
      qty: quantity,
      note: notes[id] || "",
    }));
  const orderTotal = selectedItems.reduce(
    (total, item) => total + Number(item.price) * item.qty,
    0,
  );

  const submitOrder = async () => {
    setOrdering(true);
    try {
      const response = await fetch("/api/public/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          items: selectedItems.map((item) => ({
            menu_id: item.id,
            qty: item.qty,
            note: item.note,
          })),
        }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to submit order");
      router.push(`/public/order/${encodeURIComponent(responseData.data.so_no)}`);
    } catch (error) {
      toast.error(error.message || "Failed to submit order");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="bg-white min-h-screen w-full p-4 relative">
      <div className="fixed bottom-0 z-50 left-1/2 mb-5">
        <Button
          size="lg"
          disabled={!selectedItems.length}
          onClick={() => setOrderOpen(true)}>
          <CalendarArrowDown /> Order Now ({selectedItems.length})
        </Button>
      </div>

      <TableTitle title={"Our Menu"} desc={"choose your favorite!"} />

      <MyTableHeader
        limitData={["30", "50", "100"]}
        limitValue={limit}
        searchValue={search}
        onLimitChange={(value) => {
          setLimit(Number(value));
          setPage(1);
        }}
        onSearchChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        showButton={false}
      />

      <ToggleGroup
        variant="outline"
        value={categoryFilter}
        multiple={false}
        onValueChange={(value) => {
          const selectedCategory = Array.isArray(value) ? value[0] : value;
          setCategoryFilter(selectedCategory || "all");
          setPage(1);
        }}
        className={"py-4 flex-wrap"}>
        <ToggleGroupItem value="all">All</ToggleGroupItem>

        {category.map((e) => (
          <ToggleGroupItem key={e.id} value={String(e.id)}>
            {e.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : data.length == 0 ? (
        <div className="flex justify-center items-center text-sm text-stone-400">
          no data found
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {data.map((e) => {
            return (
              <div key={e.id} className="shadow-sm rounded-lg overflow-hidden">
                <div className="w-full h-36 overflow-hidden relative">
                  <img
                    src={e.images}
                    alt={e.name}
                    className={`w-full h-full object-cover transition-all ease-in-out hover:scale-105 hover:rotate-2 ${!e.available && "opacity-5"}`}
                  />
                  {!e.available && (
                    <div className="absolute right-0 top-0 z-10 text-xs bg-white m-2 px-2  rounded-full text-red-700 font-bold">
                      not available
                    </div>
                  )}
                </div>

                <div className="px-2 ">
                  <span
                    className={`text-xs text-nowrap  ${e.available ? "text-stone-500" : "text-muted"}  `}>{`Rp ${Number(e.price).toLocaleString("id-ID")}`}</span>
                  <span
                    className={`text-sm  font-black block ${e.available ? "text-orange-600" : "text-muted"}`}>
                    {e.name}
                  </span>
                </div>

                {e.available && (
                  <div className="flex items-center gap-2 px-2 py-4">
                    <button
                      className={`border rounded-full px-2 ${!quantities[e.id] && "hover:cursor-not-allowed opacity-10"}`}
                      disabled={!quantities[e.id]}
                      onClick={() => updateQuantity(e.id, -1)}>
                      <Minus size={15} />
                    </button>

                    <span className="px-1 text-center">
                      {quantities[e.id] || 0}
                    </span>

                    <button
                      className={`border rounded-full px-2 ${!e.available && "hover:cursor-not-allowed opacity-10"}`}
                      disabled={!e.available}
                      onClick={() => updateQuantity(e.id, 1)}>
                      <Plus size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Pagination
        loading={loading}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
      />

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Confirm Order - {table ? `${table}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-4 overflow-y-auto">
            {selectedItems.map((item) => (
              <div key={item.id} className="space-y-2 border-b pb-3">
                <div className="flex justify-between gap-3 font-medium">
                  <span>{item.name} x {item.qty}</span>
                  <span>
                    Rp {(Number(item.price) * item.qty).toLocaleString("id-ID")}
                  </span>
                </div>
                <Input
                  placeholder="Note for this item (optional)"
                  maxLength={500}
                  value={notes[item.id] || ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="text-right text-base font-bold">
            Total: Rp {orderTotal.toLocaleString("id-ID")}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={ordering} onClick={submitOrder}>
              {ordering ? <Spinner /> : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
