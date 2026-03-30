import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const createErrorId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

type EditMode = "quick" | "pro" | "background" | "character" | "enhance";

const CREDIT_COSTS: Record<EditMode, number> = {
  quick: 1,
  pro: 3,
  enhance: 2,
  background: 2,
  character: 3,
};

// Diese Prompts werden als Basis für das neue Bild an Pollinations angehängt
const modeSystemPrompts: Record<EditMode, string> = {
  quick: "High contrast, saturated colors, sharp focus.",
  pro: "Cinematic color grading, epic lighting, volumetric light rays, lens flares, dramatic depth of field.",
  background: "Epic background, atmospheric perspective, fog, particles, striking environment.",
  character: "Dynamic character pose, glowing effects, rim lighting, detailed face.",
  enhance: "Maximized contrast, teal-orange cinematic grading, professional studio lighting, striking visual hierarchy.",
};

const isValidImageInput = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (value.startsWith("https://") || value.startsWith("http://")) return true;
  if (value.startsWith("data:image/")) return true;
  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method === "GET") {
    return jsonResponse(200, {
      success: true,
      function: "edit-thumbnail",
      version: "2026-03-30-pollinations-free",
    });
  }

  try {
    const errorId = createErrorId();
    const body = await req.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const mode: EditMode =
      body?.mode && modeSystemPrompts[body.mode as EditMode]
        ? (body.mode as EditMode)
        : "quick";

    console.log("edit-thumbnail request (Pollinations):", { errorId, hasPrompt: !!prompt, mode });

    if (!prompt) {
      return jsonResponse(400, {
        success: false,
        error: "Missing required field: prompt",
        details: { required: ["prompt"] },
      });
    }

    // Load Supabase env vars (Kein Google API Key mehr nötig!)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const missingEnv: string[] = [];
    if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

    if (missingEnv.length > 0) {
      console.error("Missing env vars:", missingEnv);
      return jsonResponse(500, {
        success: false,
        error: "Server configuration error: missing environment variables",
        details: { missingEnv, errorId },
      });
    }

    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Missing Authorization header" });
    }

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace("Bearer ", "");
    
    // Fetch User
    const userResp = await supabaseClient.auth.getUser(token);
    const user = userResp.data.user;
    if (userResp.error || !user) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Invalid token" });
    }

    // Fetch Profile for Credits
    const profileResp = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();
    
    const profile = profileResp.data;
    if (profileResp.error || !profile) {
      return jsonResponse(500, { success: false, error: "Failed to load user profile" });
    }

    const cost = CREDIT_COSTS[mode] ?? 1;
    if (profile.credits < cost) {
      return jsonResponse(402, { success: false, error: "Nicht genügend Credits. Bitte lade dein Konto auf." });
    }

    // --------------------------------------------------------------------------
    // GENERATE IMAGE VIA POLLINATIONS.AI (100% FREE, NO API KEY)
    // --------------------------------------------------------------------------
    const stylePrompt = modeSystemPrompts[mode];
    
    // We combine the base prompt with the user's instructions to generate a completely new image
    const fullPrompt = `A high quality, cinematic YouTube thumbnail for a video. ${stylePrompt}. Subject: ${prompt}. Epic lighting, highly detailed, vibrant colors, 8k resolution, trending on artstation.`;
    
    // We use a random seed to ensure a unique image every time
    const seed = Math.floor(Math.random() * 10000000);
    
    // Pollinations generates the image directly on-demand when the URL is accessed!
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&nologo=true&seed=${seed}`;

    console.log("Successfully generated Pollinations URL:", pollinationsUrl);

    // Deduct credits on success
    const { error: deductError } = await supabaseClient
      .from("profiles")
      .update({ credits: Math.max(0, profile.credits - cost) })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Failed to deduct credits:", { errorId, deductError });
    }

    return jsonResponse(200, {
      success: true,
      imageUrl: pollinationsUrl,
      mode,
      creditsSpent: cost,
      creditsRemaining: Math.max(0, profile.credits - cost),
    });
  } catch (e) {
    const errorId = createErrorId();
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("edit-thumbnail unhandled error:", { errorId, message });
    return jsonResponse(500, { success: false, error: message, details: { errorId } });
  }
});
