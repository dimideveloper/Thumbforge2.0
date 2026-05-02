import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
};

const MAGNIFIC_API_KEY = "FPSXa7bb73c175468f059b12160719b52a8b";
const BASE_URL = "https://api.freepik.com/v1/ai";

// Helper to convert URL to Base64
async function urlToBase64(url: string): Promise<string> {
  if (url.startsWith("data:image/")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, endpoint, method = "POST", payload, taskId } = body;

    console.log(`Proxying request: ${action} ${endpoint} ${taskId || ""}`);

    let targetUrl = "";
    let fetchOptions: any = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": MAGNIFIC_API_KEY,
      },
    };

    if (action === "start") {
      targetUrl = `${BASE_URL}/${endpoint}`;
      
      // Special handling for Mystic Remix (Image-to-Image)
      if (endpoint === "mystic" && payload.structure_reference_url) {
        console.log("Converting structure_reference_url to base64...");
        const base64 = await urlToBase64(payload.structure_reference_url);
        delete payload.structure_reference_url;
        payload.structure_reference = base64;
      }
      
      fetchOptions.body = JSON.stringify(payload);
    } else if (action === "poll") {
      targetUrl = `${BASE_URL}/${endpoint}/${taskId}`;
      fetchOptions.method = "GET";
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
