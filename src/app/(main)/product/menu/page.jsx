"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { toast } from "sonner";

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/product/menu?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
        );
        const responseData = await response.json();
        if (!response.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch menus");
        }
        if (active) {
          setData((responseData.data || []).map((menu) => ({
            ...menu,
            price: menu.price == null ? "-" : `Rp ${Number(menu.price).toLocaleString("id-ID")}`,
          })));
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
  }, [page, limit, debouncedSearch]);

  return (
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
      <SimpleTable
        table={["name", "price"]}
        dataMap={["name", "price"]}
        data={data}
        loading={loading}
        showPic
        pic_url="images"
        onRowClick={(menu) => router.push(`/product/menu/${menu.id}`)}
      />
      <Pagination loading={loading} totalPages={totalPages} page={page} onPageChange={setPage} />
    </>
  );
}
