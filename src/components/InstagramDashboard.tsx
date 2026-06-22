"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Users, MessageCircle } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import RefreshButton from "@/components/RefreshButton";
import Topbar from "@/components/Topbar";

type InstagramSummary = {
  followersCount: number;
  mediaCount: number;
  reach: number;
  totalInteractions: number;
};

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export default function InstagramDashboard() {
  const [summary, setSummary] = useState<InstagramSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/instagram", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setSummary(data);
      setLastUpdated(new Date());
    } catch {
      setError(
        "Couldn't load live Instagram data — check INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID. Showing placeholder values below."
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const subtitle = lastUpdated
    ? `Live from Instagram · last updated ${lastUpdated.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`
    : "Performance across @thecarcinofoundation, last 30 days.";

  return (
    <>
      <Topbar
        title="Instagram"
        subtitle={subtitle}
        action={<RefreshButton onRefresh={fetchData} />}
      />

      {error && <p className="text-[14px] text-ash mb-6 -mt-4">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <KpiCard
          label="Total Reach"
          value={summary ? formatNumber(summary.reach) : "186K"}
          delta="18.2%"
          trend="up"
          icon={Heart}
        />
        <KpiCard
          label="Followers"
          value={summary ? formatNumber(summary.followersCount) : "21,408"}
          delta="2.4%"
          trend="up"
          icon={Users}
        />
        <KpiCard
          label="Interactions"
          value={summary ? formatNumber(summary.totalInteractions) : "412"}
          delta="1.6%"
          trend="down"
          icon={MessageCircle}
        />
      </section>

      <section className="frosted-card p-8">
        <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
          Top posts this month
        </h2>
        <p className="text-[14px] text-slate mb-6">Ranked by engagement rate</p>
        <div className="flex flex-col divide-y divide-fog">
          {[
            { title: "Survivor story: Maria's 5-year milestone", eng: "9.4%" },
            { title: "World Cancer Day awareness reel", eng: "8.1%" },
            { title: "Behind the lab: new screening research", eng: "6.7%" },
            { title: "Volunteer spotlight: weekend clinic", eng: "5.2%" },
          ].map((post) => (
            <div key={post.title} className="flex items-center justify-between py-4">
              <span className="text-[14px] text-ink-black">{post.title}</span>
              <span className="text-[14px] font-medium text-graphite">{post.eng}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
