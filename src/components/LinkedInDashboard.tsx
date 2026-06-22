"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Users, MousePointerClick } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import RefreshButton from "@/components/RefreshButton";
import Topbar from "@/components/Topbar";

type LinkedInSummary = {
  followerCount: number;
  impressions: number;
  clicks: number;
};

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export default function LinkedInDashboard() {
  const [summary, setSummary] = useState<LinkedInSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/linkedin", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setSummary(data);
      setLastUpdated(new Date());
    } catch {
      setError(
        "Couldn't load live LinkedIn data — check LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORGANIZATION_ID. Showing placeholder values below."
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const subtitle = lastUpdated
    ? `Live from LinkedIn · last updated ${lastUpdated.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : "Performance for The Carcino Foundation page, last 30 days.";

  return (
    <>
      <Topbar
        title="LinkedIn"
        subtitle={subtitle}
        action={<RefreshButton onRefresh={fetchData} />}
      />

      {error && <p className="text-[14px] text-ash mb-6 -mt-4">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <KpiCard
          label="Total Reach"
          value={summary ? formatNumber(summary.impressions) : "94K"}
          delta="6.9%"
          trend="up"
          icon={Eye}
        />
        <KpiCard
          label="Followers"
          value={summary ? formatNumber(summary.followerCount) : "8,732"}
          delta="1.2%"
          trend="up"
          icon={Users}
        />
        <KpiCard
          label="Clicks"
          value={summary ? formatNumber(summary.clicks) : "156"}
          delta="4.3%"
          trend="up"
          icon={MousePointerClick}
        />
      </section>

      <section className="frosted-card p-8">
        <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
          Audience by role
        </h2>
        <p className="text-[14px] text-slate mb-6">Followers, grouped by job function</p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Clinical & research", value: 38 },
            { label: "Healthcare administration", value: 27 },
            { label: "Nonprofit & philanthropy", value: 21 },
            { label: "Other", value: 14 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4">
              <span className="text-[14px] text-graphite w-44 shrink-0">{row.label}</span>
              <div className="flex-1 h-2 rounded-pill bg-fog overflow-hidden">
                <div className="h-full rounded-pill bg-strong" style={{ width: `${row.value}%` }} />
              </div>
              <span className="text-[14px] text-slate w-10 text-right">{row.value}%</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
