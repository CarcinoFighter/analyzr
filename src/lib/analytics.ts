import { LucideIcon, Globe, Users, Target, BarChart3, TrendingDown, UserPlus, Clock } from "lucide-react";

export type MetricKey =
  | "activeUsers"
  | "screenPageViews"
  | "conversions"
  | "sessions"
  | "bounceRate"
  | "newUsers"
  | "averageSessionDuration"
  | "totalUsers";

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  icon: LucideIcon;
  ga4Name: string;
  /** Roughly categorise so we can apply different formatting */
  kind: "count" | "ratio" | "duration";
};

export const METRIC_CATALOG: Record<MetricKey, MetricDefinition> = {
  activeUsers: {
    key: "activeUsers",
    label: "Total Reach",
    icon: Globe,
    ga4Name: "activeUsers",
    kind: "count",
  },
  screenPageViews: {
    key: "screenPageViews",
    label: "Page Views",
    icon: Users,
    ga4Name: "screenPageViews",
    kind: "count",
  },
  conversions: {
    key: "conversions",
    label: "Conversions",
    icon: Target,
    ga4Name: "conversions",
    kind: "count",
  },
  sessions: {
    key: "sessions",
    label: "Sessions",
    icon: BarChart3,
    ga4Name: "sessions",
    kind: "count",
  },
  bounceRate: {
    key: "bounceRate",
    label: "Bounce Rate",
    icon: TrendingDown,
    ga4Name: "bounceRate",
    kind: "ratio",
  },
  newUsers: {
    key: "newUsers",
    label: "New Users",
    icon: UserPlus,
    ga4Name: "newUsers",
    kind: "count",
  },
  averageSessionDuration: {
    key: "averageSessionDuration",
    label: "Avg. Session",
    icon: Clock,
    ga4Name: "averageSessionDuration",
    kind: "duration",
  },
  totalUsers: {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    ga4Name: "totalUsers",
    kind: "count",
  },
};

export const DEFAULT_METRICS: MetricKey[] = [
  "activeUsers",
  "screenPageViews",
  "conversions",
];

export const AVAILABLE_METRICS = Object.values(METRIC_CATALOG);

export function formatMetricValue(kind: MetricDefinition["kind"], value: number): string {
  if (kind === "count") {
    return Math.round(value).toLocaleString("en-US");
  }
  if (kind === "ratio") {
    return `${(value * 100).toFixed(1)}%`;
  }
  // duration – convert seconds to mm:ss
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
