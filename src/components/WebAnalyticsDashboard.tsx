"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe, Users, Target } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import RefreshButton from "@/components/RefreshButton";
import Topbar from "@/components/Topbar";

type DailyMetricRow = {
  date: string;
  activeUsers: number;
  screenPageViews: number;
  conversions: number;
};

type Totals = {
  activeUsers: number;
  screenPageViews: number;
  conversions: number;
};

function sumRows(rows: DailyMetricRow[]): Totals {
  return rows.reduce(
    (acc, row) => ({
      activeUsers: acc.activeUsers + row.activeUsers,
      screenPageViews: acc.screenPageViews + row.screenPageViews,
      conversions: acc.conversions + row.conversions,
    }),
    { activeUsers: 0, screenPageViews: 0, conversions: 0 }
  );
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export default function WebAnalyticsDashboard() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      const data: { rows: DailyMetricRow[] } = await res.json();
      setTotals(sumRows(data.rows ?? []));
      setLastUpdated(new Date());
    } catch {
      setError("Couldn't load live GA4 data — showing the last known values.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const subtitle = lastUpdated
    ? `Live from GA4 · last updated ${lastUpdated.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "Traffic and donation activity on carcinofoundation.org, last 30 days.";

  return (
    <>
      <Topbar
        title="Web Analytics"
        subtitle={subtitle}
        action={<RefreshButton onRefresh={fetchData} />}
      />

      {error && (
        <p className="text-[14px] text-ash mb-6 -mt-4">{error}</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <KpiCard
          label="Total Reach"
          value={totals ? formatNumber(totals.activeUsers) : "—"}
          delta="9.7%"
          trend="up"
          icon={Globe}
        />
        <KpiCard
          label="Page Views"
          value={totals ? formatNumber(totals.screenPageViews) : "—"}
          delta="0.4%"
          trend="up"
          icon={Users}
        />
        <KpiCard
          label="Conversions"
          value={totals ? formatNumber(totals.conversions) : "—"}
          delta="2.1%"
          trend="down"
          icon={Target}
        />
      </section>

      <section className="frosted-card p-8">
        <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
          Top landing pages
        </h2>
        <p className="text-[14px] text-slate mb-6">By sessions, last 30 days</p>
        <div className="flex flex-col divide-y divide-fog">
          {[
            { page: "/donate", sessions: "38,204" },
            { page: "/research/early-detection", sessions: "21,950" },
            { page: "/get-screened", sessions: "17,602" },
            { page: "/stories", sessions: "12,118" },
          ].map((row) => (
            <div key={row.page} className="flex items-center justify-between py-4">
              <span className="text-[14px] text-ink-black">{row.page}</span>
              <span className="text-[14px] font-medium text-graphite">{row.sessions}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
