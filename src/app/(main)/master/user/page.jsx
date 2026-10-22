"use client";

import TableTitle from "@/components/layout/TableTitle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";

export default function UserPage() {
  const [data, setData] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    role_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const limitOption = [30, 50, 100];

  const openCreateDialog = () => {
    setEditingUser(null);
    setForm({ username: "", name: "", password: "", role_id: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username || "",
      name: user.name || "",
      password: "",
      role_id: String(user.role?.id || ""),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(
        editingUser
          ? `/api/master/user?id=${editingUser.id}`
          : "/api/master/user",
        {
          method: editingUser ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to save user");
      }
      toast.success(editingUser ? "User updated" : "User created");
      setDialogOpen(false);
      setPage(1);
      setDebouncedSearch(search);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    try {

      const response = await fetch(`/api/master/user?id=${user}`, {
        method: "DELETE",
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to delete user");
      }
      toast.success("User deleted");
      setPage((currentPage) =>
        data.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage,
      );
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetch("/api/master/role")
      .then((response) => response.json())
      .then((responseData) => {
        if (!responseData.success) throw new Error(responseData.message);
        setRoles(responseData.data || []);

      })
      .catch((error) => toast.error(error.message || "Failed to fetch roles"));
    
  }, []);

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
          `/api/master/user?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
        );
        const responseData = await res.json();
        if (!res.ok || !responseData.success) {
          throw new Error(responseData.message || "Failed to fetch users");
        }
        if (active) {
          setData(responseData.users || []);
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

  return (
    <div>
      <TableTitle
        title={"Master Data User"}
        desc={
          "Master data User merupakan halaman untuk mengelola User yang terdaftar"
        }
      />
      <div className="flex justify-between items-end pt-4 pb-2">
        <div className="flex gap-2">
          <Input
            className="text-sm w-fit"
            type="text"
            placeholder="search user"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}>
            <SelectTrigger className="">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>limit</SelectLabel>
                {limitOption.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button type="button" onClick={openCreateDialog}>
          Create user
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32">
                <div className="flex justify-center items-center">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : data.length == 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-32">
                <div className="flex justify-center items-center text-sm text-stone-400">
                  no data found
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((e) => {
              return (
                <TableRow key={e.id} className="text-sm">
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.username}</TableCell>
                  <TableCell>{e.role?.name}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="bg-amber-300 hover:bg-amber-600"
                      onClick={() => openEditDialog(e)}>
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            className="bg-red-500 hover:bg-red-700">
                            <Trash />
                          </Button>
                        }
                      />

                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this item? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(e.id)}>
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-start gap-1 pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={loading || page === 1}
          onClick={() => setPage((currentPage) => currentPage - 1)}
          aria-label="Previous page">
          <ChevronLeft />
        </Button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? "default" : "outline"}
              size="sm"
              disabled={loading}
              onClick={() => setPage(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}>
              {pageNumber}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={loading || page === totalPages}
          onClick={() => setPage((currentPage) => currentPage + 1)}
          aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit user" : "Create user"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user data." : "Add a new user account."}
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
            <Input
              placeholder="Username"
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder={editingUser ? "New password (optional)" : "Password"}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required={!editingUser}
            />
            <Select
              value={form.role_id}
              onValueChange={(value) => setForm({ ...form, role_id: value })}
              required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={saving || roles.length === 0}>
                {saving ? <Spinner /> : editingUser ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
