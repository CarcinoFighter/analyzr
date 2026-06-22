import Topbar from "@/components/Topbar";
import KpiCard from "@/components/KpiCard";
import SimpleRefresh from "@/components/SimpleRefresh";
import { Users, Radio, Target } from "lucide-react";

export default function OverviewPage() {
  return (
    <>
      <Topbar
        title="Overview"
        subtitle="A morning snapshot of how The Carcino Foundation is reaching people, across every channel."
        action={<SimpleRefresh />}
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <KpiCard
          label="Total Reach"
          value="482K"
          delta="12.4%"
          trend="up"
          icon={Radio}
        />
        <KpiCard
          label="Followers"
          value="34,920"
          delta="3.1%"
          trend="up"
          icon={Users}
        />
        <KpiCard
          label="Conversions"
          value="1,284"
          delta="0.8%"
          trend="down"
          icon={Target}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="frosted-card p-8 lg:col-span-2">
          <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
            Reach by channel
          </h2>
          <p className="text-[14px] text-slate mb-6">Last 30 days</p>
          <div className="flex items-end gap-4 h-48">
            {[
              { label: "Instagram", value: 72 },
              { label: "LinkedIn", value: 48 },
              { label: "Web", value: 95 },
              { label: "Email", value: 35 },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-3 flex-1">
                <div className="w-full flex items-end h-36">
                  <div
                    className="w-full rounded-[10px] bg-fog relative overflow-hidden"
                    style={{ height: `${bar.value}%` }}
                  >
                    <div className="absolute inset-0 bg-strong opacity-90" />
                  </div>
                </div>
                <span className="text-[12px] text-slate">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="frosted-card p-8 flex flex-col">
          <h2 className="text-[18px] leading-[1.33] font-medium text-ink-black mb-1">
            This week
          </h2>
          <p className="text-[14px] text-slate mb-6">Notable movement</p>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <span aria-hidden className="spectrum-bar h-2 w-2 rounded-full mt-1.5 shrink-0" />
              <p className="text-[14px] text-graphite">
                Instagram reach grew fastest, driven by the awareness-day campaign.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="spectrum-bar h-2 w-2 rounded-full mt-1.5 shrink-0" />
              <p className="text-[14px] text-graphite">
                Web Analytics conversions dipped slightly after the donation form update.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="spectrum-bar h-2 w-2 rounded-full mt-1.5 shrink-0" />
              <p className="text-[14px] text-graphite">
                LinkedIn engagement steady, with research-partner posts performing best.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
