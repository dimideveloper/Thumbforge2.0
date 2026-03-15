import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const THUMB_QUALITIES = ["maxresdefault", "hqdefault", "mqdefault", "default"] as const;
const MAX_RESULTS = 8;

const fallbackVideoIds = [
  "dQw4w9WgXcQ",
  "9bZkp7q19f0",
  "kJQP7kiw5Fk",
  "JGwWNGJdvx8",
  "OPf0YbXqDm0",
  "2Vv-BfVoq4g",
  "RgKAFK5djSk",
  "fRh_vgS2dFE",
];

const thumbnailExists = async (url: string): Promise<boolean> => {
  try {
    const headRes = await fetch(url, { method: "HEAD" });
    if (headRes.ok) return true;

    if (headRes.status === 405) {
      const getRes = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-1" },
      });
      return getRes.ok;
    }

    return false;
  } catch {
    return false;
  }
};

const findBestThumbnail = async (videoId: string): Promise<string | null> => {
  for (const quality of THUMB_QUALITIES) {
    const candidate = `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
    if (await thumbnailExists(candidate)) {
      return candidate;
    }
  }
  return null;
};

/** Collect Shorts video IDs so we can exclude them */
const extractShortsIds = (html: string): Set<string> => {
  const shortsIds = new Set<string>();
  // Matches /shorts/VIDEO_ID patterns in the HTML
  const shortsRegex = /\/shorts\/([a-zA-Z0-9_-]{11})/g;
  let m: RegExpExecArray | null;
  while ((m = shortsRegex.exec(html)) !== null) {
    shortsIds.add(m[1]);
  }
  // Also catch reelWatchEndpoints which indicate Shorts
  const reelRegex = /"reelWatchEndpoint":\{[^}]*"videoId":"([a-zA-Z0-9_-]{11})"/g;
  while ((m = reelRegex.exec(html)) !== null) {
    shortsIds.add(m[1]);
  }
  return shortsIds;
};

const extractVideoIdsFromSearchHtml = (html: string): string[] => {
  const shortsIds = extractShortsIds(html);
  const ids = new Set<string>();
  const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;

  let match: RegExpExecArray | null;
  // Collect more candidates so we still have enough after filtering
  while ((match = regex.exec(html)) !== null && ids.size < MAX_RESULTS * 3) {
    const id = match[1];
    if (VIDEO_ID_REGEX.test(id) && !shortsIds.has(id)) {
      ids.add(id);
    }
  }

  return Array.from(ids).slice(0, MAX_RESULTS);
};

/** Check if a thumbnail is landscape (16:9-ish). Returns false for Shorts (vertical/square). */
const isLandscapeThumbnail = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-500" } });
    if (!res.ok) return false;
    const buf = new Uint8Array(await res.arrayBuffer());
    // JPEG: parse SOF0/SOF2 markers for dimensions
    for (let i = 0; i < buf.length - 8; i++) {
      if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
        const h = (buf[i + 5] << 8) | buf[i + 6];
        const w = (buf[i + 7] << 8) | buf[i + 8];
        if (w > 0 && h > 0) return w / h > 1.3; // landscape = wider than 1.3:1
      }
    }
    // If we can't parse, assume landscape for standard YT thumb URLs
    return true;
  } catch {
    return true;
  }
};

const fetchVideoMeta = async (videoId: string) => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;

    const data = await res.json();
    // oembed gives thumbnail dimensions — use them to detect Shorts
    const tw = typeof data?.thumbnail_width === "number" ? data.thumbnail_width : 480;
    const th = typeof data?.thumbnail_height === "number" ? data.thumbnail_height : 360;
    const isLandscape = tw / th > 1.3;

    return {
      title: typeof data?.title === "string" ? data.title : `YouTube Video ${videoId}`,
      channel: typeof data?.author_name === "string" ? data.author_name : "YouTube",
      isLandscape,
    };
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required", videos: [] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ThumbnailSaaSBot/1.0)",
      },
    });

    const searchHtml = searchResponse.ok ? await searchResponse.text() : "";
    const extractedIds = extractVideoIdsFromSearchHtml(searchHtml);
    const candidateIds = extractedIds.length > 0 ? extractedIds : fallbackVideoIds;

    const allResults = await Promise.all(
      candidateIds.slice(0, MAX_RESULTS * 2).map(async (videoId, index) => {
        const [thumbnail, meta] = await Promise.all([
          findBestThumbnail(videoId),
          fetchVideoMeta(videoId),
        ]);

        // Skip if oembed says it's not landscape (i.e. a Short)
        if (meta && !meta.isLandscape) return null;

        return {
          id: videoId,
          videoId,
          title: meta?.title || `YouTube Inspiration #${index + 1}`,
          channel: meta?.channel || "YouTube",
          views: "Live on YouTube",
          thumbnail,
          isThumbnailAvailable: Boolean(thumbnail),
        };
      }),
    );

    const videos = allResults.filter(Boolean).slice(0, MAX_RESULTS);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("youtube-search error:", message);
    return new Response(JSON.stringify({ error: message, videos: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
