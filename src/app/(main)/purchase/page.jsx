"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function PurchasePage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [form, setForm] = useState({
    po_date: "",
    supplier_id: "",
    account_id: "",
  });
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [purchaseResponse, supplierResponse, accountResponse] =
          await Promise.all([
            fetch(
              `/api/purchase?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
            ),
            fetch("/api/master/supplier?page=1&limit=100"),
            fetch("/api/master/account?page=1&limit=100"),
          ]);
        const purchases = await purchaseResponse.json();
        const suppliersData = await supplierResponse.json();
        const accountsData = await accountResponse.json();
        if (!purchaseResponse.ok || !purchases.success)
          throw new Error(purchases.message || "Failed to fetch purchases");
        if (!supplierResponse.ok || !suppliersData.success)
          throw new Error(suppliersData.message || "Failed to fetch suppliers");
        if (!accountResponse.ok || !accountsData.success)
          throw new Error(accountsData.message || "Failed to fetch accounts");
        if (active) {
          setData(purchases.data || []);
          setTotalPages(purchases.totalPages || 1);
          setSuppliers(suppliersData.data || []);
          setAccounts(accountsData.data || []);
        }
      } catch (error) {
        if (active) toast.error(error.message || "Failed to fetch purchases");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [page, limit, debouncedSearch]);

  const createPurchase = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to create purchase");
      toast.success("Purchase created");
      setDialogOpen(false);
      router.push(`/purchase/${responseData.data.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to create purchase");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TableTitle title="Purchase Order" desc="Kelola purchase order" />
      <MyTableHeader
        limitData={[30, 50, 100]}
        buttonLabel="Add purchase"
        limitValue={limit}
        searchValue={search}
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
        table={["po no", "date", "supplier", "total", "status"]}
        dataMap={[
          "po_no",
          "po_date",
          "supplier.name",
          "total_amount",
          "status",
        ]}
        data={data.map((purchase) => ({
          ...purchase,
          "supplier.name": purchase.supplier?.name || "-",
          total_amount: `Rp ${Number(purchase.total_amount || 0).toLocaleString("id-ID")}`,
        }))}
        loading={loading}
        onRowClick={(purchase) => router.push(`/purchase/${purchase.id}`)}
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
            <DialogTitle>Add Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={createPurchase} className="space-y-3">
            <label className="block text-sm font-medium">PO Date</label>
            <Input
              type="date"
              value={form.po_date}
              onChange={(event) =>
                setForm({ ...form, po_date: event.target.value })
              }
              required
            />
            <label className="block text-sm font-medium">Supplier</label>
            <div className="relative">
              <Input
                placeholder="Search supplier..."
                value={supplierSearch}
                onFocus={() => setShowSuppliers(true)}
                onChange={(event) => {
                  setSupplierSearch(event.target.value);
                  setForm({ ...form, supplier_id: "" });
                  setShowSuppliers(true);
                }}
                required
              />
              {showSuppliers && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {suppliers
                    .filter((supplier) =>
                      supplier.name
                        .toLowerCase()
                        .includes(supplierSearch.toLowerCase()),
                    )
                    .slice(0, 30)
                    .map((supplier) => (
                      <button
                        type="button"
                        key={supplier.id}
                        className="block w-full p-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setSupplierSearch(supplier.name);
                          setForm({
                            ...form,
                            supplier_id: String(supplier.id),
                          });
                          setShowSuppliers(false);
                        }}
                      >
                        {supplier.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
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
                        }}
                      >
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
              <Button
                type="submit"
                disabled={saving || !form.supplier_id || !form.account_id}
              >
                {saving ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
