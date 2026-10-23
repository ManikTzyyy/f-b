"use client";

import TableTitle from "@/components/layout/TableTitle";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle,
  ChefHat,
  ClipboardList,
  LoaderCircle,
  Play,
  X,
  BookmarkCheck,
  HandPlatter,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const progressConfig = {
  pending: {
    label: "Pending",
    icon: ClipboardList,
    header: "bg-blue-500",
    button: "bg-blue-500 hover:bg-blue-700",
    next: "cooking",
    action: "Start Cooking",
    action_icon: Play,
  },
  cooking: {
    label: "Cooking",
    icon: ChefHat,
    header: "bg-red-500",
    button: "bg-red-500 hover:bg-red-700",
    next: "ready",
    action: "Mark Ready",
    action_icon: BookmarkCheck,
  },
  ready: {
    label: "Ready",
    icon: CheckCircle,
    header: "bg-green-500",
    button: "bg-green-500 hover:bg-green-700",
    next: "delivered",
    action: "Mark Delivered",
    action_icon: HandPlatter,
  },
  delivered: {
    label: "Delivered",
    icon: HandPlatter,
    header: "bg-purple-500",
    button: "bg-purple-500 hover:bg-purple-700",
    next: null,
    action: null,
  },
};

export default function KdsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState({});
  const [totalData, setTotalData] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/order-status?page=${page}&limit=10${
          status === "all" ? "" : `&progress=${encodeURIComponent(status)}`
        }`,
      );
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to fetch orders");
      }
      setData(responseData.result.data || []);
      setTotalPages(responseData.result.totalPages || 1);
      setTotalData(responseData.result.totalData || 0);
      setMetric(responseData.result.counts || {});
    } catch (error) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProgress = async (order, progress) => {
    setSavingId(order.id);
    try {
      const response = await fetch("/api/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, progress }),
      });
      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to update order");
      }
      await loadData();
      toast.success(`Order ${order.so_no} updated`);
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between pb-2">
        <TableTitle
          title="Live kitchen display"
          desc="Monitor order progress"
        />
        <Pagination
          loading={loading}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
        />
      </div>

      <ToggleGroup
        variant="outline"
        value={status}
        multiple={false}
        onValueChange={(value) => {
          setStatus(value || "all");
          setPage(1);
        }}
        className="flex-wrap py-2"
      >
        <ToggleGroupItem value="all">
          All <span className="ml-2">{loading ? <Spinner /> : totalData}</span>
        </ToggleGroupItem>
        {Object.entries(progressConfig).map(([value, config]) => (
          <ToggleGroupItem
            key={value}
            value={value}
            variant={
              value === "pending"
                ? "blue"
                : value === "cooking"
                  ? "red"
                  : value === "ready"
                    ? "green"
                    : "purple"
            }
            size="lg"
          >
            {config.label}
            <span className="ml-2">
              {loading ? <Spinner /> : metric[value] || 0}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-stone-500">
          No orders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 border-t border-stone-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((order) => {
            const config =
              progressConfig[order.progress] || progressConfig.pending;
            const Icon = config.icon;
            const ActionIcon = config.action_icon;
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-lg border h-fit"
              >
                <div
                  className={`${config.header} flex items-center justify-between px-4 py-5 text-xs text-white`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className="h-4 w-4 animate-bounce" />
                    <span>{config.label}</span>
                  </div>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-xl font-bold">#{order.so_no}</div>
                  <div className="rounded bg-orange-600 px-3 py-1 text-sm text-white">
                    {order.table || "-"}
                  </div>
                </div>
                <div className="divide-y border-y border-stone-200">
                  {order.sales_order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[auto_1fr] gap-3 px-4 py-3"
                    >
                      <div className="text-3xl font-bold flex items-center justify-start">
                        <div className="">{item.qty}</div>
                        <X />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-orange-600">
                          {item.menu?.name || "-"}
                        </div>
                        {item.note && (
                          <p className="wrap-break-word text-xs text-stone-500">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {config.next && (
                  <Button
                    type="button"
                    className={`w-full rounded-none text-white text-lg font-bold py-7 ${config.button}`}
                    disabled={savingId === order.id}
                    onClick={() => updateProgress(order, config.next)}
                  >
                    {savingId === order.id ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <ActionIcon />
                    )}
                    {savingId === order.id ? "Saving..." : config.action}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
