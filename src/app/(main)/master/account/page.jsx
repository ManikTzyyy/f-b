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

export default function AccountPage() {
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
  const [form, setForm] = useState({ name: "", type: "", initial_balance: "" });

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
        const res = await fetch(`/api/master/account?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
        const responseData = await res.json();
        if (!res.ok || !responseData.success) throw new Error(responseData.message || "Failed to fetch accounts");
        if (active) { setData(responseData.data || []); setTotalPages(responseData.totalPages || 1); }
      } catch (error) {
        if (active) toast.error("Failed to fetch data", { description: error.message });
      } finally { if (active) setLoading(false); }
    };
    loadData();
    return () => { active = false; };
  }, [page, debouncedSearch, limit, refreshKey]);

  const openCreateDialog = () => { setEditData(null); setForm({ name: "", type: "", initial_balance: "" }); setDialogOpen(true); };
  const openEditDialog = (account) => { setEditData(account); setForm({ name: account.name || "", type: account.type || "", initial_balance: account.initial_balance ?? "" }); setDialogOpen(true); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(editData ? `/api/master/account?id=${editData.id}` : "/api/master/account", { method: editData ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) throw new Error(responseData.message || "Failed to save account");
      toast.success(editData ? "Account updated" : "Account created");
      setDialogOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (error) { toast.error(error.message || "Failed to save account"); }
    finally { setSaving(false); }
  };
  const handleDelete = async (account) => {
    try {
      const response = await fetch(`/api/master/account?id=${account.id}`, { method: "DELETE" });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) throw new Error(responseData.message || "Failed to delete account");
      toast.success("Account deleted");
      setPage((currentPage) => data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage);
      setRefreshKey((key) => key + 1);
    } catch (error) { toast.error(error.message || "Failed to delete account"); }
  };

  return (
    <>
      <TableTitle title="Master Data Account" desc="Master Data Account merupakan halaman untuk mengelola akun yang terdaftar seperti cash ataupun Bank" />
      <MyTableHeader limitData={limitOption} buttonLabel="Create account" limitValue={limit} searchValue={search} onCreate={openCreateDialog} onLimitChange={(value) => { setLimit(Number(value)); setPage(1); }} onSearchChange={(event) => { setSearch(event.target.value); setPage(1); }} />
      <SimpleTable table={["id", "name", "type", "initial balance"]} data={data} dataMap={["id", "name", "type", "initial_balance"]} loading={loading} showAction onEdit={openEditDialog} onDelete={handleDelete} />
      <Pagination loading={loading} totalPages={totalPages} page={page} onPageChange={setPage} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editData ? "Edit Account" : "Create Account"}</DialogTitle><DialogDescription>{editData ? "Update account data." : "Create new account data."}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Input placeholder="Type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} />
            <Input type="number" placeholder="Initial balance" value={form.initial_balance} onChange={(event) => setForm({ ...form, initial_balance: event.target.value })} />
            <DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose><Button type="submit" disabled={saving || !form.name.trim()}>{saving ? "Saving..." : editData ? "Save changes" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
