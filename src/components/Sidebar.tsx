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
    <aside className="hidden lg:flex lg:flex-col lg:w-[280px] shrink-0 h-screen sticky top-0 p-6">
      <div className="flex flex-col h-full frosted-card relative overflow-hidden border border-snow/50 dark:border-white/5">
        
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-quartz/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Logo mark */}
          <div className="flex items-center gap-3 px-2 pb-6">
            <svg className="h-9 w-9 shrink-0 drop-shadow-sm" viewBox="0 0 936 1112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M427.428 276.812C431.465 242.458 436.775 222.828 463.228 185.759C510.256 129.855 546.197 123.942 607.989 113.776L608.596 113.676C695.384 108.798 736.608 151.073 757.22 197.683C777.832 244.293 774.789 326.132 768.611 370.032C762.432 413.932 737.693 528.971 597.206 642.244C635.718 655.794 639.161 653.643 685.62 660.532C730.099 613.38 755.519 578.536 819.599 502.274C883.678 426.013 920.136 320.17 930.252 255.133C940.369 190.095 942.728 113.676 889.028 58.3944C835.328 3.11258 730.569 -4.17402 664.466 3.11261C598.362 10.3992 484.05 55.7068 406.273 121.806C328.496 187.905 290.195 255.133 260.904 349.437C231.613 443.741 248.479 521.098 284.771 617.716C346.401 744.611 422.003 830.713 487.636 872.988C553.269 915.262 599.375 938.025 671.517 1058.34C760.474 917.972 795.557 865.069 864.077 785.187C819.599 730.989 762.102 700.29 649.278 684.921C536.454 669.552 500.127 633.217 478.958 632.349C457.79 631.482 433.395 631.265 425.801 629.097C418.207 626.929 416.096 626.622 410.07 613.38C403.569 589.969 410.07 555.93 410.07 551.053C410.07 546.175 399.764 539.671 399.764 533.167C399.764 526.664 403.232 522.801 410.613 519.076C410.613 519.076 393.798 509.862 393.798 502.274C393.798 494.687 401.391 465.962 399.764 459.458C398.137 452.954 359.625 444.825 366.676 431.817C373.728 418.81 428.76 352.279 435.564 338.597C442.368 324.915 428.388 309.446 427.428 276.812Z" fill="url(#logo-gradient)"/>
              <path d="M374.813 838.301C249.417 911.791 165.783 954.391 60.7512 983.551L0 1112C60.7512 1107.66 269.041 1007.4 432.31 888.163L374.813 838.301Z" fill="url(#logo-gradient)"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="936" y2="1112" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9875C1" />
                  <stop offset="1" stopColor="#0358f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-[17px] font-semibold tracking-tight text-ink-black leading-none mt-1">
                Carcino Analyzr
              </span>
              <span className="text-[12px] font-medium tracking-wide text-slate leading-none uppercase">
                TCF
              </span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-pebble/50 to-transparent mb-6" />

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-strong text-strong-foreground shadow-md shadow-strong/10 translate-x-1"
                      : "text-graphite hover:bg-fog hover:text-ink-black hover:translate-x-1"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white dark:bg-black rounded-r-full" />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.75}
                    className={`transition-colors duration-300 ${isActive ? "text-strong-foreground" : "text-steel group-hover:text-ink-black"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-2">
            <div className="h-px bg-gradient-to-r from-transparent via-pebble/50 to-transparent mb-5" />
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[13px] font-medium text-graphite">Appearance</span>
              <ThemeToggle />
            </div>
            <div className="bg-fog/50 rounded-lg p-3 border border-pebble/30">
              <p className="text-[11px] leading-relaxed text-slate text-center">
                Reports refresh every morning at <span className="font-medium text-ink-black">6:00 AM</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
