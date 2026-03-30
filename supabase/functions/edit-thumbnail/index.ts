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

const modeSystemPrompts: Record<EditMode, string> = {
  quick: `You are a YouTube thumbnail editor. Apply fast, impactful improvements:
- Boost contrast and saturation by ~20%
- Sharpen the main subject
- Add subtle vignette for focus
- Make colors pop more
Keep the edit subtle but noticeable. Maintain the original composition exactly.`,

  pro: `You are an elite YouTube thumbnail designer who creates thumbnails for channels with 10M+ subscribers.
Apply professional-grade edits:
- Cinematic color grading with rich, deep colors
- Dramatic lighting with volumetric light rays and lens flares where appropriate
- Strong subject-background separation with depth of field
- High contrast between foreground elements and background
- Professional glow effects on key elements (swords, items, characters)
- Epic atmospheric effects (particles, sparks, embers, dust motes)
- Bold, vibrant color palette optimized for YouTube CTR
- Clean edges and sharp details on the main subject
Make it look like a Hollywood movie poster meets top-tier YouTube content. The result must be stunning and click-worthy.`,

  background: `You are a background specialist for YouTube thumbnails.
Focus exclusively on improving the background:
- Generate epic, dramatic backgrounds that complement the foreground subject
- Add depth with atmospheric perspective, fog, or particle effects
- Create dramatic skies, explosions, or environmental effects
- Use complementary colors that make the foreground subject pop
- Add volumetric lighting and god rays
- Ensure the background supports the thumbnail's story without distracting from the subject
Keep the foreground subject exactly as-is. Only transform the background.`,

  character: `You are a character enhancement specialist for gaming YouTube thumbnails.
Focus on making characters and objects look more impressive:
- Add dynamic glow and rim lighting to characters
- Enhance armor, weapons, and items with shiny/reflective effects
- Add energy effects, auras, or power-up glows
- Improve facial expressions to be more dramatic/expressive
- Add motion blur or action lines for dynamic poses
- Make items look legendary/epic quality with golden glows or enchantment effects
Keep the background and overall composition unchanged. Only enhance the characters and objects.`,

  enhance: `You are a YouTube thumbnail optimization expert who maximizes click-through rate.
Apply comprehensive thumbnail optimization:
- Maximize contrast between subject and background (subject should pop)
- Apply cinematic color grading (teal-orange, dramatic warm/cool split)
- Add professional lighting effects (rim light, key light enhancement, volumetric rays)
- Strengthen visual hierarchy so the eye goes to the main subject first
- Add subtle depth-of-field to separate foreground from background
- Boost saturation strategically (oversaturate key elements, desaturate distractions)
- Add dramatic atmosphere (particles, sparks, lens flares, light leaks)
- Ensure text areas remain readable with good contrast
- Make the overall image feel "premium" and "cinematic"
The goal is to make this thumbnail impossible to scroll past on YouTube.`,
};

const isValidImageInput = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (value.startsWith("https://") || value.startsWith("http://")) return true;
  if (value.startsWith("data:image/")) return true;
  return false;
};

// Fetch an image URL and return it as base64 + mimeType for Gemini
const imageToBase64 = async (url: string): Promise<{ data: string; mimeType: string }> => {
  if (url.startsWith("data:image/")) {
    const [header, data] = url.split(",");
    const mimeType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
    return { data, mimeType };
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const data = btoa(binary);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mimeType = contentType.split(";")[0].trim();
  return { data, mimeType };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method === "GET") {
    return jsonResponse(200, {
      success: true,
      function: "edit-thumbnail",
      version: "2026-03-30-gemini-direct",
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
    const referenceImageUrl = body?.referenceImageUrl;

    console.log("edit-thumbnail request:", { errorId, hasImage: !!imageUrl, hasPrompt: !!prompt, mode });

    if (!imageUrl || !prompt) {
      return jsonResponse(400, {
        success: false,
        error: "Missing required fields",
        details: { required: ["imageUrl", "prompt"], received: { hasImageUrl: !!imageUrl, hasPrompt: !!prompt } },
      });
    }

    if (!isValidImageInput(imageUrl)) {
      return jsonResponse(400, { success: false, error: "A valid imageUrl is required" });
    }

    // Load env vars
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const missingEnv: string[] = [];
    if (!GOOGLE_API_KEY) missingEnv.push("GOOGLE_API_KEY");
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

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Missing Authorization header", details: { errorId } });
    }

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const token = authHeader.replace("Bearer ", "");
    const userResp = await supabaseClient.auth.getUser(token);
    const user = userResp.data.user;
    if (userResp.error || !user) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Invalid token", details: { errorId } });
    }

    // Load profile / credits
    const profileResp = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();
    const profile = profileResp.data;
    if (profileResp.error || !profile) {
      return jsonResponse(500, { success: false, error: "Failed to load user profile", details: { errorId } });
    }

    const cost = CREDIT_COSTS[mode] ?? 1;
    if (profile.credits < cost) {
      return jsonResponse(402, { success: false, error: "Nicht genügend Credits. Bitte lade dein Konto auf." });
    }

    // Convert main image to base64
    let mainImage: { data: string; mimeType: string };
    try {
      mainImage = await imageToBase64(imageUrl);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to load main image:", message);
      return jsonResponse(400, { success: false, error: "Could not load the provided image", details: { errorId } });
    }

    // Build Gemini request parts
    const systemPrompt = modeSystemPrompts[mode];
    const userText = isValidImageInput(referenceImageUrl)
      ? `${systemPrompt}\n\nEdit this YouTube thumbnail. I'm also providing a reference image for style inspiration. User instruction: ${prompt}`
      : `${systemPrompt}\n\nUser instruction: ${prompt}`;

    const parts: any[] = [
      { text: userText },
      { inlineData: { mimeType: mainImage.mimeType, data: mainImage.data } },
    ];

    // Optionally attach reference image
    if (isValidImageInput(referenceImageUrl)) {
      try {
        const refImage = await imageToBase64(referenceImageUrl);
        parts.push({ inlineData: { mimeType: refImage.mimeType, data: refImage.data } });
      } catch (e) {
        console.warn("Could not load reference image, skipping:", e);
      }
    }

    // Call Google Gemini image generation API
    const geminiModel = "gemini-2.0-flash-exp-image-generation";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GOOGLE_API_KEY}`;

    console.log("Calling Gemini API:", { errorId, model: geminiModel, mode });

    let aiResponse: Response;
    try {
      aiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("Gemini network error:", message);
      return jsonResponse(502, { success: false, error: "AI network error", details: { message, errorId } });
    }

    console.log("Gemini response status:", { errorId, status: aiResponse.status });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Gemini API error:", { errorId, status: aiResponse.status, body: errorText.slice(0, 800) });

      if (aiResponse.status === 429) {
        return jsonResponse(429, {
          success: false,
          error: "Rate limit exceeded. Please wait a moment and try again.",
        });
      }
      if (aiResponse.status === 400) {
        return jsonResponse(400, {
          success: false,
          error: "Invalid request. Please try a different image or prompt.",
          details: { errorId },
        });
      }
      return jsonResponse(502, {
        success: false,
        error: "AI request failed",
        details: { errorId, status: aiResponse.status },
      });
    }

    const aiData = await aiResponse.json();

    // Extract image from Gemini response (base64 inlineData)
    let editedImageUrl: string | null = null;
    const candidates = aiData?.candidates ?? [];
    for (const candidate of candidates) {
      const contentParts = candidate?.content?.parts ?? [];
      for (const part of contentParts) {
        if (part?.inlineData?.data && part?.inlineData?.mimeType) {
          editedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      if (editedImageUrl) break;
    }

    if (!editedImageUrl) {
      console.error("No image in Gemini response:", { errorId, preview: JSON.stringify(aiData).slice(0, 600) });
      return jsonResponse(502, {
        success: false,
        error: "The AI did not return an edited image. Please try again with a different image or prompt.",
        details: { errorId },
      });
    }

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
      imageUrl: editedImageUrl,
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
