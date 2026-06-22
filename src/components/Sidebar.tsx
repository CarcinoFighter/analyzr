"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Camera, Briefcase, BarChart3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutGrid },
  { label: "Instagram", href: "/instagram", icon: Camera },
  { label: "LinkedIn", href: "/linkedin", icon: Briefcase },
  { label: "Web Analytics", href: "/web-analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] shrink-0 h-screen sticky top-0 p-6">
      <div className="flex flex-col h-full frosted-card p-6">
        {/* Logo mark — the single spectrum accent, used once */}
        <div className="flex items-center gap-3 px-2 pb-8">
          <span
            aria-hidden
            className="spectrum-bar h-7 w-7 rounded-[10px] shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[16px] font-medium tracking-[-0.02em] text-ink-black">
              Carcino Analyzr
            </span>
            <span className="text-[10px] tracking-normal text-slate">
              The Carcino Foundation
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-navitems text-[14px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-strong text-strong-foreground"
                    : "text-graphite hover:bg-fog hover:text-ink-black"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className={isActive ? "text-strong-foreground" : "text-steel group-hover:text-ink-black"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <div className="h-px bg-fog mb-4" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] text-graphite">Appearance</span>
            <ThemeToggle />
          </div>
          <p className="text-[10px] leading-[1.5] text-slate">
            Reports refresh every morning at 6:00 AM.
          </p>
        </div>
      </div>
    </aside>
  );
}
