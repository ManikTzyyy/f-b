"use client";
import { useState, useEffect } from "react";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SupplierPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const limitOption = [30, 50, 100];
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    if (search === "" && debouncedSearch === "") return;
    const handler = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/master/supplier?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
        const responseData = await res.json();
        if (!res.ok || !responseData.success) throw new Error(responseData.message || "Failed to fetch suppliers");
        if (active) { setData(responseData.data || []); setTotalPages(responseData.totalPages || 1); }
      } catch (error) {
        if (active) toast.error("Failed to fetch data", { description: error.message });
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [page, debouncedSearch, limit, refreshKey]);

  const openCreateDialog = () => {
    setEditData(null);
    setForm({ name: "", phone: "", address: "" });
    setDialogOpen(true);
  };
  const openEditDialog = (supplier) => {
    setEditData(supplier);
    setForm({ name: supplier.name || "", phone: supplier.phone || "", address: supplier.address || "" });
    setDialogOpen(true);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(editData ? `/api/master/supplier?id=${editData.id}` : "/api/master/supplier", {
        method: editData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) throw new Error(responseData.message || "Failed to save supplier");
      toast.success(editData ? "Supplier updated" : "Supplier created");
      setDialogOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (error) { toast.error(error.message || "Failed to save supplier"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (supplier) => {
    try {
      const response = await fetch(`/api/master/supplier?id=${supplier.id}`, { method: "DELETE" });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) throw new Error(responseData.message || "Failed to delete supplier");
      toast.success("Supplier deleted");
      setPage((currentPage) => data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage);
      setRefreshKey((key) => key + 1);
    } catch (error) { toast.error(error.message || "Failed to delete supplier"); }
  };

  return (
    <>
      <TableTitle title="Master Data Supplier" desc="Master data Supplier merupakan halaman untuk mengelola Supplier yang terdaftar" />
      <MyTableHeader limitData={limitOption} buttonLabel="Create supplier" limitValue={limit} searchValue={search} onCreate={openCreateDialog} onLimitChange={(value) => { setLimit(Number(value)); setPage(1); }} onSearchChange={(event) => { setSearch(event.target.value); setPage(1); }} />
      <SimpleTable table={["id", "name", "phone", "address"]} data={data} dataMap={["id", "name", "phone", "address"]} loading={loading} showAction onEdit={openEditDialog} onDelete={handleDelete} />
      <Pagination loading={loading} totalPages={totalPages} page={page} onPageChange={setPage} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editData ? "Edit Supplier" : "Create Supplier"}</DialogTitle><DialogDescription>{editData ? "Update supplier data." : "Create new supplier data."}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Input placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            <DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose><Button type="submit" disabled={saving || !form.name.trim()}>{saving ? "Saving..." : editData ? "Save changes" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
