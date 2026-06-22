"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

type RefreshButtonProps = {
  onRefresh: () => Promise<void> | void;
  label?: string;
};

export default function RefreshButton({ onRefresh, label = "Refresh" }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Keep the spin visible briefly so quick refreshes still feel responsive.
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-4 py-2.5 rounded-buttons bg-pebble text-[14px] font-medium text-ink-black transition-colors duration-200 hover:bg-strong hover:text-strong-foreground disabled:opacity-70"
    >
      <RefreshCw size={15} strokeWidth={2} className={isRefreshing ? "spin-slow" : ""} />
      {isRefreshing ? "Refreshing…" : label}
    </button>
  );
}
