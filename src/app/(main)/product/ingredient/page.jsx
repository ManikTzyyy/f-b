"use client";

import { MyTableHeader } from "@/components/layout/MyTableHeader";
import TableTitle from "@/components/layout/TableTitle";
import { Pagination } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { SimpleTable } from "@/components/layout/SimpleTable";

export default function IngredientsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [category, setCategory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const limitOption = [30, 50, 100];

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (search === "" && debouncedSearch === "") return;
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search, debouncedSearch]);

  useEffect(() => {
    let active = true;
    const loadCategory = async () => {
      setLoadingCategory(true);
      try {
        const res = await fetch(`/api/master/category`);
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
        const res = await fetch(
          `/api/product/ingredient?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}${
            categoryFilter === "all"
              ? ""
              : `&category=${encodeURIComponent(categoryFilter)}`
          }`,
        );
        const responseData = await res.json();
        if (!res.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch ingredients");
        }
        if (active) {
          setData(responseData.data || []);
          setTotalPages(responseData.totalPages || 1);
        }
      } catch (error) {
        if (active) toast.error("Failed to fetch data", { description: error.message });
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
          <TableTitle title="Stok Bahan" desc="Pantau dan kelola stok" />

          <MyTableHeader
            limitData={limitOption}
            buttonLabel="Create data"
            limitValue={limit}
            searchValue={search}
            onCreate={() => router.push("/product/ingredient/create")}
            onLimitChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
            onSearchChange={(e) => {
              setSearch(e.target.value);
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
            table={[ "name", "stock", "unit"]}
            dataMap={[ "name", "current_stock", "unit"]}
            loading={loading}
            data={data}
            onRowClick={(ingredient) =>
              router.push(`/product/ingredient/${ingredient.id}`)
            }
            showPic
            pic_url="images"
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
