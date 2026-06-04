// functions/api/analytics.js
export async function onRequest(context) {
  const API_TOKEN = context.env.CF_API_TOKEN;
  const ZONE_ID = context.env.CF_ZONE_ID;

  if (!API_TOKEN || !ZONE_ID) {
    return new Response(JSON.stringify({ 
      error: "Missing Cloudflare Credentials in Environment. Please set CF_API_TOKEN and CF_ZONE_ID in Pages Settings." 
    }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  // GraphQL query: fetch the sum of page views, requests, and bytes in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const query = {
    query: `
      query GetPageViews($zoneId: String!) {
        viewer {
          zones(filter: { zoneTag: $zoneId }) {
            httpRequests1dGroups(limit: 7, filter: { date_geq: "${sevenDaysAgo}" }) {
              sum {
                pageViews
                requests
                bytes
              }
            }
          }
        }
      }
    `,
    variables: { zoneId: ZONE_ID }
  };

  try {
    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errTxt = await response.text();
      return new Response(JSON.stringify({ error: `Cloudflare API returned error: ${response.status}`, details: errTxt }), {
        status: 502,
        headers: { "content-type": "application/json" }
      });
    }

    const result = await response.json();
    const zones = result?.data?.viewer?.zones;

    if (!zones || zones.length === 0) {
      return new Response(JSON.stringify({ error: "Zone not found or analytics not accessible." }), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
    }

    // Accumulate the last 7 days of request data
    const stats = zones[0].httpRequests1dGroups.reduce((acc, curr) => {
      acc.pageViews += curr.sum.pageViews || 0;
      acc.requests += curr.sum.requests || 0;
      acc.bytes += curr.sum.bytes || 0;
      return acc;
    }, { pageViews: 0, requests: 0, bytes: 0 });

    // Format metrics
    const payload = {
      pageViews: stats.pageViews,
      requests: stats.requests,
      bandwidthMB: Math.round(stats.bytes / (1024 * 1024))
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300" // Cache response for 5 minutes at Cloudflare edge
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
