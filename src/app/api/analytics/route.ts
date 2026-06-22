import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

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
  date: string; // "YYYY-MM-DD"
  activeUsers: number;
  screenPageViews: number;
  conversions: number;
};

export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    return NextResponse.json(
      { error: "Missing GA4_PROPERTY_ID environment variable" },
      { status: 500 }
    );
  }

  try {
    const analyticsDataClient = getClient();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const rows: DailyMetricRow[] = (response.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      // GA4 returns dates as "YYYYMMDD" — reformat to "YYYY-MM-DD"
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

      return {
        date,
        activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
        screenPageViews: Number(row.metricValues?.[1]?.value ?? 0),
        conversions: Number(row.metricValues?.[2]?.value ?? 0),
      };
    });

    return NextResponse.json({ propertyId, rows });
  } catch (error) {
    console.error("GA4 reporting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google Analytics data" },
      { status: 502 }
    );
  }
}
