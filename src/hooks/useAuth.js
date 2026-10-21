"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser } from "@/services/auth";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (form) => {
    setLoading(true);

    try {
      await loginUser(form);

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success("Logout success! Redirecting...");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to logout, Try Again.");
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
