import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// LinkedIn metrics via the LinkedIn Marketing API.
//
// Prerequisites:
//   1. A LinkedIn Page (organization) you administer.
//   2. A LinkedIn App (developer.linkedin.com) with the "Community
//      Management API" or "Marketing Developer Platform" product approved —
//      LinkedIn reviews these requests manually, budget time for that.
//   3. An OAuth 2.0 access token with the `r_organization_social` and
//      `rw_organization_admin` scopes. LinkedIn access tokens expire (~60
//      days) and must be refreshed via a refresh token — there is no
//      service-account style credential like GA4's.
//
// Env vars:
//   LINKEDIN_ACCESS_TOKEN    — OAuth access token with org read scopes
//   LINKEDIN_ORGANIZATION_ID — numeric organization id (from your Page admin URL)
// ---------------------------------------------------------------------------

export type LinkedInSummary = {
  followerCount: number;
  impressions: number;
  clicks: number;
};

function orgUrn(organizationId: string) {
  return `urn:li:organization:${organizationId}`;
}

export async function GET() {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!accessToken || !organizationId) {
    return NextResponse.json(
      {
        error:
          "Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORGANIZATION_ID environment variables",
      },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": "202401",
    "X-Restli-Protocol-Version": "2.0.0",
  };

  try {
    // Follower count snapshot.
    const followerUrl = new URL(
      "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics"
    );
    followerUrl.searchParams.set("q", "organizationalEntity");
    followerUrl.searchParams.set("organizationalEntity", orgUrn(organizationId));

    // Page-level impressions and clicks for the last 30 days act as our
    // "reach" and "conversions" stand-ins — LinkedIn's organic share
    // statistics are the closest equivalent to GA4's conversions metric.
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const sharesUrl = new URL(
      "https://api.linkedin.com/v2/organizationalEntityShareStatistics"
    );
    sharesUrl.searchParams.set("q", "organizationalEntity");
    sharesUrl.searchParams.set("organizationalEntity", orgUrn(organizationId));
    sharesUrl.searchParams.set("timeIntervals.timeGranularityType", "DAY");
    sharesUrl.searchParams.set(
      "timeIntervals.timeRange.start",
      thirtyDaysAgo.toString()
    );
    sharesUrl.searchParams.set("timeIntervals.timeRange.end", now.toString());

    const [followerRes, sharesRes] = await Promise.all([
      fetch(followerUrl.toString(), { headers }),
      fetch(sharesUrl.toString(), { headers }),
    ]);

    const followerJson = await followerRes.json();
    const sharesJson = await sharesRes.json();

    if (!followerRes.ok) {
      throw new Error(followerJson?.message ?? "Follower stats request failed");
    }
    if (!sharesRes.ok) {
      throw new Error(sharesJson?.message ?? "Share stats request failed");
    }

    const followerCount =
      followerJson?.elements?.[0]?.followerCounts?.organicFollowerCount ?? 0;

    const totals = (sharesJson?.elements ?? []).reduce(
      (acc: { impressions: number; clicks: number }, el: {
        totalShareStatistics?: { impressionCount?: number; clickCount?: number };
      }) => ({
        impressions: acc.impressions + (el.totalShareStatistics?.impressionCount ?? 0),
        clicks: acc.clicks + (el.totalShareStatistics?.clickCount ?? 0),
      }),
      { impressions: 0, clicks: 0 }
    );

    const summary: LinkedInSummary = {
      followerCount,
      impressions: totals.impressions,
      clicks: totals.clicks,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("LinkedIn API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn data" },
      { status: 502 }
    );
  }
}
