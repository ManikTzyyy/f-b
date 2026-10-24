"use client";

import TableTitle from "@/components/layout/TableTitle";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Minus, Plus, CalendarArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicMenu() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [category, setCategory] = useState([]);

  const [quantities, setQuantities] = useState({});
  const updateQuantity = (productId, amount) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + amount),
    }));
    console.log(quantities);
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
      setLoadingCategory(true);
      try {
        const res = await fetch(`/api/master/menu-category`);
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
      } finally {
        if (active) setLoadingCategory(false);
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
  return (
    <div className="bg-white min-h-screen w-full p-4 relative">
      <div className="fixed bottom-0 z-50 left-1/2 mb-5">
        <Button size="lg"><CalendarArrowDown /> Order Now!</Button>
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
    </div>
  );
}
