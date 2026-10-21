"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Utensils } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";

import { useLogin } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (!error) return;
    const messages = {
      session_missing: "Session not found. Please log in again.",
      session_invalid:
        "The session is invalid or has been modified. Please log in again.",
    };

    toast.error(messages[error] || "Session error. Please log in again.");
    router.replace("/login");
  }, [router, searchParams]);

  const { login, loading } = useLogin();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success("Login successful! Redirecting...");
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    }
  };
  return (
    <div className="bg-stone-100 px-2 py-4 rounded-xl flex flex-col items-center min-w-80 relative z-10">
      <Utensils className="text-orange-500" size={70} />
      <p className="pb-5 text-stone-700">Hello!!!</p>

      <form className="space-y-4 flex flex-col" onSubmit={handleLogin}>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input
            type="text"
            name="username"
            className="bg-white text-sm"
            placeholder="Enter username"
            onChange={handleChange}
          />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input
            type="password"
            name="password"
            className="bg-white text-sm"
            placeholder="***"
            onChange={handleChange}
          />
        </Field>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner></Spinner> : "Login"}
        </Button>
      </form>
    </div>
  );
}
