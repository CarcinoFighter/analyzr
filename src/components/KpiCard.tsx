import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

export default function KpiCard({ label, value, delta, trend, icon: Icon }: KpiCardProps) {
  const isUp = trend === "up";

  return (
    <div className="frosted-card p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-slate">{label}</span>
        <span className="flex items-center justify-center h-9 w-9 rounded-[10px] bg-fog">
          <Icon size={16} strokeWidth={1.75} className="text-graphite" />
        </span>
      </div>

      <span className="text-[50px] leading-[1.18] tracking-[-2px] font-light text-ink-black">
        {value}
      </span>

      <div className="flex items-center gap-1.5">
        <span
          className={`flex items-center gap-0.5 text-[14px] font-medium ${
            isUp ? "text-ink-black" : "text-ash"
          }`}
        >
          {isUp ? (
            <ArrowUpRight size={14} strokeWidth={2} />
          ) : (
            <ArrowDownRight size={14} strokeWidth={2} />
          )}
          {delta}
        </span>
        <span className="text-[14px] text-slate">vs last month</span>
      </div>
    </div>
  );
}
