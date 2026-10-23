"use client";

import { MyTableHeader } from "@/components/layout/MyTableHeader";
import TableTitle from "@/components/layout/TableTitle";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    so_date: "",
    table: "",
    account_id: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [salesResponse, accountResponse] = await Promise.all([
          fetch(
            `/api/sales?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
          ),
          fetch("/api/master/account?page=1&limit=100"),
        ]);
        const [salesData, accountsData] = await Promise.all([
          salesResponse.json(),
          accountResponse.json(),
        ]);

        if (!salesResponse.ok || !salesData.success)
          throw new Error(salesData.message || "Failed to fetch sales");
        if (!accountResponse.ok || !accountsData.success)
          throw new Error(accountsData.message || "Failed to fetch accounts");
        if (active) {
          setData((salesData.data || []).map((order) => ({
            ...order,
            total_amount: `Rp ${Number(order.total_amount || 0).toLocaleString("id-ID")}`,
          })));
          setTotalPages(salesData.totalPages || 1);
          setAccounts(accountsData.data || []);
        }
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch sales");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [page, limit, debouncedSearch]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to create sales");
      toast.success("Sales order created");
      setDialogOpen(false);
      router.push(`/sales/${responseData.data.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to create sales");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TableTitle title="Sales Order" desc="Kelola sales order" />
      <MyTableHeader
        limitData={[30, 50, 100]}
        limitValue={limit}
        searchValue={search}
        buttonLabel="Add Sales"
        onCreate={() => setDialogOpen(true)}
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
        table={[
          "SO No",
          "Date",
          "Table",
          "Account",
          "Progress",
          "Status",
          "Grand Total",
        ]}
        dataMap={[
          "so_no",
          "so_date",
          "table",
          "account.name",
          "progress",
          "status",
          "total_amount",
        ]}
        data={data}
        loading={loading}
        onRowClick={(order) => router.push(`/sales/${order.id}`)}
      />
      <Pagination
        loading={loading}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sales Order</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleCreate}>
            <label className="block text-sm font-medium">SO Date</label>
            <Input
              type="date"
              value={form.so_date}
              onChange={(event) =>
                setForm({ ...form, so_date: event.target.value })
              }
              required
            />

            <label className="block text-sm font-medium">Table Number</label>
            <Input
              type="text"
              placeholder="eg.3 (optional)"
              value={form.table}
              onChange={(event) =>
                setForm({ ...form, table: event.target.value })
              }
            />
            <label className="block text-sm font-medium">Account</label>
            <div className="relative">
              <Input
                placeholder="Search account..."
                value={accountSearch}
                onFocus={() => setShowAccounts(true)}
                onChange={(event) => {
                  setAccountSearch(event.target.value);
                  setForm({ ...form, account_id: "" });
                  setShowAccounts(true);
                }}
                required
              />
              {showAccounts && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {accounts
                    .filter((account) =>
                      (account.name || "")
                        .toLowerCase()
                        .includes(accountSearch.toLowerCase()),
                    )
                    .slice(0, 30)
                    .map((account) => (
                      <button
                        type="button"
                        key={account.id}
                        className="block w-full p-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setAccountSearch(account.name);
                          setForm({ ...form, account_id: String(account.id) });
                          setShowAccounts(false);
                        }}>
                        {account.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving || !form.account_id}>
                {saving ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
