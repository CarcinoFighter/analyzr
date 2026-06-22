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

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden sticky top-0 z-10 px-4 pt-4">
      <div className="frosted-card flex items-center justify-between px-4 py-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="spectrum-bar h-6 w-6 rounded-[8px] shrink-0" />
          <span className="text-[14px] font-medium text-ink-black">Carcino Analyzr</span>
        </div>
        <ThemeToggle />
      </div>
      <nav className="frosted-card flex items-center gap-1 px-2 py-2 mb-4 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-[14px] whitespace-nowrap shrink-0 transition-colors duration-200 ${
                isActive ? "bg-strong text-strong-foreground" : "text-graphite hover:bg-fog"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
