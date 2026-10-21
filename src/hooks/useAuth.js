"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";

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