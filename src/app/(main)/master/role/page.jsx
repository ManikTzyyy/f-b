"use client";
import { useState, useEffect } from "react";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";

import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RolePage() {
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const limitOption = [30, 50, 100];

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(false);

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

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/master/role?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
        );
        const responseData = await res.json();
        if (!res.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch users");
        }

        if (active) {
          setData(responseData.data || []);
          setTotalPages(responseData.totalPages || 1);
        }
      } catch (error) {
        if (active) {
          toast.error("Failed to fetch data", {
            description: error.message || "Something went wrong",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, limit]);

  const tableCols = ["id", "role"];
  const tableDataMap = ["id", "name"];

  return (
    <>
      <TableTitle
        title={"Master Data Role"}
        desc={
          "Master data Role merupakan halaman untuk mengelola role yang terdaftar"
        }
      />
      <MyTableHeader
        limitData={limitOption}
        buttonLabel="Create role"
        limitValue={limit}
        searchValue={search}
        onCreate={() => {}}
        onLimitChange={(value) => {
          setLimit(Number(value));
          setPage(1);
        }}
        onSearchChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <SimpleTable
        table={tableCols}
        data={data}
        dataMap={tableDataMap}
        loading={loading}
        showAction
      />

      <Pagination loading={loading} totalPages={totalPages} page={page} />
    </>
  );
}
