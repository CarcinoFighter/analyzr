import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Instagram metrics via the Meta Graph API.
//
// Prerequisites (this is the part that takes the longest to set up):
//   1. The Instagram account must be a Business or Creator account.
//   2. It must be linked to a Facebook Page you manage.
//   3. You need a Meta App (developers.facebook.com) with the
//      `instagram_basic` and `instagram_manage_insights` permissions.
//   4. Generate a long-lived Page access token for that app — short-lived
//      tokens expire in ~1 hour, long-lived ones last ~60 days and must be
//      refreshed periodically (there's no service-account equivalent here).
//
// Env vars:
//   INSTAGRAM_ACCESS_TOKEN        — long-lived access token
//   INSTAGRAM_BUSINESS_ACCOUNT_ID — the IG user id linked to your Page
// ---------------------------------------------------------------------------

const GRAPH_API_VERSION = "v21.0";

export type InstagramSummary = {
  followersCount: number;
  mediaCount: number;
  reach: number;
  totalInteractions: number;
};

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !igUserId) {
    return NextResponse.json(
      {
        error:
          "Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables",
      },
      { status: 500 }
    );
  }

  try {
    // Snapshot fields: current follower and media counts.
    const profileUrl = new URL(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}`
    );
    profileUrl.searchParams.set("fields", "followers_count,media_count");
    profileUrl.searchParams.set("access_token", accessToken);

    // Time-series insights: reach and total interactions over the last 30 days.
    // "total_interactions" (likes + comments + shares + saves) stands in for
    // a conversions-style engagement metric — Instagram has no native
    // "conversions" concept the way GA4 does.
    const insightsUrl = new URL(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${igUserId}/insights`
    );
    insightsUrl.searchParams.set("metric", "reach,total_interactions");
    insightsUrl.searchParams.set("period", "day");
    insightsUrl.searchParams.set("metric_type", "total_value");
    insightsUrl.searchParams.set(
      "since",
      Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000).toString()
    );
    insightsUrl.searchParams.set("until", Math.floor(Date.now() / 1000).toString());
    insightsUrl.searchParams.set("access_token", accessToken);

    const [profileRes, insightsRes] = await Promise.all([
      fetch(profileUrl.toString()),
      fetch(insightsUrl.toString()),
    ]);

    const profileJson = await profileRes.json();
    const insightsJson = await insightsRes.json();

    if (!profileRes.ok) {
      throw new Error(profileJson?.error?.message ?? "Profile request failed");
    }
    if (!insightsRes.ok) {
      throw new Error(insightsJson?.error?.message ?? "Insights request failed");
    }

    const findMetric = (name: string): number => {
      const entry = insightsJson?.data?.find(
        (item: { name: string; total_value?: { value?: number } }) => item.name === name
      );
      return entry?.total_value?.value ?? 0;
    };

    const summary: InstagramSummary = {
      followersCount: profileJson?.followers_count ?? 0,
      mediaCount: profileJson?.media_count ?? 0,
      reach: findMetric("reach"),
      totalInteractions: findMetric("total_interactions"),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Instagram Graph API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 502 }
    );
  }
}
