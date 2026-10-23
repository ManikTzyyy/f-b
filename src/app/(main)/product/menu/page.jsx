"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";

export default function MenuPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const limitOption = [30, 50, 100];
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [category, setCategory] = useState([]);

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
          `/api/product/menu?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}${
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
          setData(
            (responseData.data || []).map((menu) => ({
              ...menu,
              price:
                menu.price == null
                  ? "-"
                  : `Rp ${Number(menu.price).toLocaleString("id-ID")}`,
            })),
          );
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
    <>
      {loadingCategory ? (
        <div className="flex justify-center items-center w-full min-h-40">
          <Spinner />
        </div>
      ) : (
        <>
          <TableTitle title="Menu" desc="Kelola data menu" />
          <MyTableHeader
            limitData={limitOption}
            buttonLabel="Create menu"
            limitValue={limit}
            searchValue={search}
            onCreate={() => router.push("/product/menu/create")}
            onLimitChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
            onSearchChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
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
            className={"py-2 flex-wrap"}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>

            {category.map((e) => (
              <ToggleGroupItem key={e.id} value={String(e.id)}>
                {e.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <SimpleTable
            table={["name", "price", 'category', 'status']}
            dataMap={["name", "price", 'category_name', '-']}
            data={data}
            loading={loading}
            showPic
            pic_url="images"
            onRowClick={(menu) => router.push(`/product/menu/${menu.id}`)}
          />
          <Pagination
            loading={loading}
            totalPages={totalPages}
            page={page}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
