"use client";

import { useRouter } from "next/navigation";
import RefreshButton from "@/components/RefreshButton";

export default function SimpleRefresh() {
  const router = useRouter();

  const handleRefresh = async () => {
    router.refresh();
    // brief pause so the spinner is visible even on a fast local refresh
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  return <RefreshButton onRefresh={handleRefresh} />;
}
