"use client";

import { useCallback, useEffect, useState } from "react";
import KpiCard from "@/components/KpiCard";
import RefreshButton from "@/components/RefreshButton";
import Topbar from "@/components/Topbar";
import MetricSelector from "@/components/MetricSelector";
import {
  MetricKey,
  DEFAULT_METRICS,
  METRIC_CATALOG,
  formatMetricValue,
} from "@/lib/analytics";

const LOCAL_STORAGE_KEY = "web-analytics-metrics";

function getInitialMetrics(): MetricKey[] {
  if (typeof window === "undefined") return DEFAULT_METRICS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_METRICS;
    const parsed = JSON.parse(raw) as MetricKey[];
    const valid = parsed.filter((k) => k in METRIC_CATALOG);
    return valid.length > 0 ? valid : DEFAULT_METRICS;
  } catch {
    return DEFAULT_METRICS;
  }
}

type Totals = Record<string, number>;

function sumRows(rows: Record<string, number>[]): Totals {
  const totals: Totals = {};
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key === "date") continue;
      totals[key] = (totals[key] ?? 0) + value;
    }
  }
  return totals;
}

function calculateDelta(current: number, previous: number): {
  delta: number;
  trend: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return { delta: current > 0 ? 100 : 0, trend: current > 0 ? "up" : "neutral" };
  }
  const delta = ((current - previous) / previous) * 100;
  if (delta > 0.5) return { delta: Math.abs(delta), trend: "up" };
  if (delta < -0.5) return { delta: Math.abs(delta), trend: "down" };
  return { delta: Math.abs(delta), trend: "neutral" };
}

function formatDelta(delta: number, trend: "up" | "down" | "neutral"): string {
  if (trend === "neutral") return delta.toFixed(1) + "%";
  return delta.toFixed(1) + "%";
}

type LandingPage = {
  path: string;
  sessions: number;
  screenPageViews: number;
};

export default function WebAnalyticsDashboard() {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(DEFAULT_METRICS);
  const [currentTotals, setCurrentTotals] = useState<Totals | null>(null);
  const [previousTotals, setPreviousTotals] = useState<Totals | null>(null);
  const [topPages, setTopPages] = useState<LandingPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedMetrics(getInitialMetrics());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedMetrics));
    }
  }, [selectedMetrics]);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const metricsParam = selectedMetrics.join(",");
      const res = await fetch(`/api/analytics?metrics=${metricsParam}&topPages=true`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Request failed");
      const data: {
        current: { rows: Record<string, number>[] };
        previous: { rows: Record<string, number>[] };
        topPages: LandingPage[] | null;
      } = await res.json();

      setCurrentTotals(sumRows(data.current.rows ?? []));
      setPreviousTotals(sumRows(data.previous.rows ?? []));
      setTopPages(data.topPages);
      setLastUpdated(new Date());
    } catch {
      setError("Couldn't load live GA4 data — showing the last known values.");
    }
  }, [selectedMetrics]);

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

      <MetricSelector selected={selectedMetrics} onChange={setSelectedMetrics} />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {selectedMetrics.map((key) => {
          const metric = METRIC_CATALOG[key];
          const current = currentTotals?.[key] ?? 0;
          const previous = previousTotals?.[key] ?? 0;
          const { delta, trend } = calculateDelta(current, previous);

          return (
            <KpiCard
              key={key}
              label={metric.label}
              value={formatMetricValue(metric.kind, current)}
              delta={formatDelta(delta, trend)}
              trend={trend}
              icon={metric.icon}
            />
          );
        })}
      </section>

      <section className="frosted-card p-8">
        <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
          Top landing pages
        </h2>
        <p className="text-[14px] text-slate mb-6">By sessions, last 30 days</p>
        <div className="flex flex-col divide-y divide-fog">
          {topPages && topPages.length > 0 ? (
            topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between py-4">
                <span className="text-[14px] text-ink-black">{page.path}</span>
                <span className="text-[14px] font-medium text-graphite">
                  {page.sessions.toLocaleString("en-US")}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[14px] text-slate py-4">Loading top pages...</p>
          )}
        </div>
      </section>
    </>
  );
}