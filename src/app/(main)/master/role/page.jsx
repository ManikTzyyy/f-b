"use client";
import { useState, useEffect } from "react";
import TableTitle from "@/components/layout/TableTitle";
import { MyTableHeader } from "@/components/layout/MyTableHeader";
import { Pagination } from "@/components/ui/pagination";
import { SimpleTable } from "@/components/layout/SimpleTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    const [refreshKey, setRefreshKey] = useState(0);

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
  }, [page, debouncedSearch, limit, refreshKey]);

  const tableCols = ["id", "role"];
  const tableDataMap = ["id", "name"];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const openCreateDialog = () => {
    setEditData(null);
    setForm({ name: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (data) => {
    setEditData(data);
    setForm({
      name: data.name || "",
    });
    setDialogOpen(true);
  };

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "" });


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(
        editData ? `/api/master/role?id=${editData.id}` : "/api/master/role",
        {
          method: editData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to save role");
      }

      toast.success(editData ? "Role updated" : "Role created");
      setDialogOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    try {
      const response = await fetch(`/api/master/role?id=${role.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to delete role");
      }

      toast.success("Role deleted");
      setPage((currentPage) =>
        data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage,
      );
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.message || "Failed to delete role");
    }
  };

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
        onCreate={openCreateDialog}
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
        onEdit={openEditDialog}
        onDelete={handleDelete}
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
            <DialogTitle>{editData ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {editData ? "Update role data." : "Create new role data."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : editData ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
