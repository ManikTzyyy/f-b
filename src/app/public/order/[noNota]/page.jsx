"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChefHat, ClipboardList, HandPlatter } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const timeline = [
  { key: "pending", label: "Order received", icon: ClipboardList },
  { key: "cooking", label: "Being prepared", icon: ChefHat },
  { key: "ready", label: "Ready to serve", icon: CheckCircle2 },
  { key: "delivered", label: "Delivered", icon: HandPlatter },
];

function PublicOrderStatusContent() {
  const { noNota } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!noNota) return;
    try {
      const response = await fetch(
        `/api/public/order/${encodeURIComponent(noNota)}`,
        { cache: "no-store" },
      );
      const responseData = await response.json();
      if (!response.ok || !responseData.success)
        throw new Error(responseData.message || "Failed to fetch order");
      setOrder(responseData.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  }, [noNota]);

  useEffect(() => {
    if (!noNota) return undefined;
    loadOrder();
    const interval = setInterval(loadOrder, 15000);
    return () => clearInterval(interval);
  }, [loadOrder]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }

  if (!order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-stone-500">Order tidak ditemukan.</p>
        <Button onClick={() => window.location.assign("/public/menu")}>
          Kembali ke menu
        </Button>
      </main>
    );
  }

  const currentIndex = timeline.findIndex((item) => item.key === order.progress);

  return (
    <main className="min-h-screen bg-stone-50 p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Order confirmed</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-orange-600">{order.so_no}</h1>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              {order.table || "-"}
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold">Order status</h2>
          <div className="space-y-4">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const active = index <= currentIndex;
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${active ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-400"}`}>
                    <Icon size={18} />
                  </div>
                  <span className={active ? "font-semibold text-stone-900" : "text-stone-400"}>
                    {item.label}
                  </span>
                  {index === currentIndex && (
                    <span className="ml-auto text-xs font-semibold text-orange-600">Current</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Your order</h2>
          <div className="divide-y">
            {order.sales_order_items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.menu?.name || "-"}</p>
                  <p className="text-sm text-stone-500">
                    {item.qty} x Rp {Number(item.unit_price).toLocaleString("id-ID")}
                  </p>
                  {item.note && <p className="text-xs text-stone-500">Note: {item.note}</p>}
                </div>
                <p className="font-semibold">
                  Rp {Number(item.sub_total).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t pt-3 text-lg font-black">
            <span>Total</span>
            <span>Rp {Number(order.total_amount).toLocaleString("id-ID")}</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function PublicOrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <PublicOrderStatusContent />
    </Suspense>
  );
}
