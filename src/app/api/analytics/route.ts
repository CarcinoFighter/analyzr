import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { MetricKey, METRIC_CATALOG } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Credentials are read from environment variables — never commit a service
// account JSON file to the repo. Set these in `.env.local` (dev) and in your
// hosting provider's secret manager (prod):
//
//   GA4_PROPERTY_ID=123456789
//   GOOGLE_CLIENT_EMAIL=my-sa@my-project.iam.gserviceaccount.com
//   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//
// Note: when you paste a private key into most env var UIs (Vercel, etc.),
// the literal newlines get escaped as "\n". The .replace() below converts
// those back into real newlines so the PEM parses correctly.
// ---------------------------------------------------------------------------

function getClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables"
    );
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

export type DailyMetricRow = {
  date: string;
  [key: string]: number | string;
};

export type TopPage = {
  path: string;
  screenPageViews: number;
  sessions: number;
};

const DEFAULT_METRICS: MetricKey[] = [
  "activeUsers",
  "screenPageViews",
  "conversions",
];

const ALLOWED_METRICS = Object.keys(METRIC_CATALOG) as MetricKey[];

function parseMetricsParam(raw: string | null): MetricKey[] {
  if (!raw) return DEFAULT_METRICS;
  const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0) as MetricKey[];
  const valid = requested.filter((k) => ALLOWED_METRICS.includes(k));
  return valid.length > 0 ? valid : DEFAULT_METRICS;
}

export async function GET(request: Request) {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing GA4_PROPERTY_ID environment variable" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const rawMetrics = url.searchParams.get("metrics");
  const metrics = parseMetricsParam(rawMetrics);
  const fetchTopPages = url.searchParams.get("topPages") === "true";

  try {
    const analyticsDataClient = getClient();

    const gaMetrics = metrics.map((key) => ({
      name: METRIC_CATALOG[key].ga4Name,
    }));

    // Fetch both current period and previous period for delta calculation
    const [currentResponse, previousResponse] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: gaMetrics,
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "60daysAgo", endDate: "30daysAgo" }],
        dimensions: [{ name: "date" }],
        metrics: gaMetrics,
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    ]);

    // API returns tuple: [response, headers, metadata]
    const currentData = currentResponse[0];
    const previousData = previousResponse[0];

    const currentRows: DailyMetricRow[] = (currentData.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

      const metricRow: DailyMetricRow = { date };
      for (let i = 0; i < metrics.length; i++) {
        metricRow[metrics[i]] = Number(row.metricValues?.[i]?.value ?? 0);
      }
      return metricRow;
    });

    const previousRows: DailyMetricRow[] = (previousData.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

      const metricRow: DailyMetricRow = { date };
      for (let i = 0; i < metrics.length; i++) {
        metricRow[metrics[i]] = Number(row.metricValues?.[i]?.value ?? 0);
      }
      return metricRow;
    });

    let topPages: TopPage[] | null = null;

    if (fetchTopPages) {
      const topPagesResponse = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "sessions" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      });

      topPages = (topPagesResponse[0].rows ?? [])
        .slice(0, 10)
        .map((row) => ({
          path: row.dimensionValues?.[0]?.value ?? "/",
          screenPageViews: Number(row.metricValues?.[0]?.value ?? 0),
          sessions: Number(row.metricValues?.[1]?.value ?? 0),
        }));
    }

    return NextResponse.json({
      current: { propertyId, rows: currentRows },
      previous: { propertyId, rows: previousRows },
      topPages,
    });
  } catch (error) {
    console.error("GA4 reporting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Analytics data" },
      { status: 502 }
    );
  }
}