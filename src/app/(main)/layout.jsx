"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        toast.error(err.message || "Something is wrong!");
      }
    };

    getUser();
  }, []);

  console.log(user);

  return (
    <div className="flex w-full gap-2">
      <Sidebar />
      <div className="w-full space-y-2 pr-2">
        <Navbar user={user}/>
        <div className="bg-white rounded-lg p-4 min-h-screen">{children}</div>
      </div>
    </div>
  );
}
