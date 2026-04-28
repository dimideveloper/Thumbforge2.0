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
- Add golden glows or enchantment effects
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
      version: "2026-04-28-gemini-direct-google-key",
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

    // Build Google Gemini Direct API request (Nano Banana image editing)
    const systemPrompt = modeSystemPrompts[mode];
    const userText = isValidImageInput(referenceImageUrl)
      ? `Edit this YouTube thumbnail. I'm also providing a reference image for style inspiration. User instruction: ${prompt}`
      : `User instruction: ${prompt}`;

    // Gemini "parts" array: text first, then images
    const parts: any[] = [
      { text: `${systemPrompt}\n\n${userText}` },
      {
        inline_data: {
          mime_type: mainImage.mimeType,
          data: mainImage.data,
        },
      },
    ];

    if (isValidImageInput(referenceImageUrl)) {
      try {
        const refImage = await imageToBase64(referenceImageUrl);
        parts.push({
          inline_data: {
            mime_type: refImage.mimeType,
            data: refImage.data,
          },
        });
      } catch (e) {
        console.warn("Could not load reference image, skipping:", e);
      }
    }

    // Try Gemini image-capable models with fallback
    const geminiModels = [
      "gemini-2.5-flash-image",
      "gemini-2.0-flash-exp-image-generation",
      "gemini-2.0-flash-exp",
      "imagen-3.0-generate-001",
    ];

    let aiResponse: Response | null = null;
    let usedModel = geminiModels[0];
    let lastModelError = "";

    for (const model of geminiModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
      console.log(`[${errorId}] Calling Gemini Direct API with model: ${model}`);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
            },
          }),
        });

        if (response.status === 404) {
          lastModelError = await response.text();
          console.warn(`[${errorId}] Model ${model} unavailable (404), trying next...`);
          continue;
        }

        if (response.status === 429) {
          lastModelError = await response.text();
          console.warn(`[${errorId}] Model ${model} rate limited (429), trying next...`);
          continue;
        }

        aiResponse = response;
        usedModel = model;
        break;
      } catch (fetchError) {
        console.error(`[${errorId}] Fetch error for model ${model}:`, fetchError);
      }
    }

    if (!aiResponse) {
      console.error("No Gemini image model available:", { errorId, lastModelError: lastModelError.slice(0, 800) });
      return jsonResponse(502, {
        success: false,
        error: "Kein verfügbares Gemini Bild-Modell.",
        details: { errorId, status: 404 },
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Gemini API error:", { errorId, status: aiResponse.status, body: errorText.slice(0, 800) });

      if (aiResponse.status === 429) {
        return jsonResponse(429, {
          success: false,
          error: "Rate Limit von Google erreicht. Bitte warte kurz und versuche es erneut.",
        });
      }
      if (aiResponse.status === 403) {
        return jsonResponse(402, {
          success: false,
          error: "Google API Quota aufgebraucht oder Billing nicht aktiviert. Bitte prüfe dein Google Cloud Projekt.",
        });
      }
      if (aiResponse.status === 400) {
        return jsonResponse(400, {
          success: false,
          error: "Ungültige Anfrage an Gemini. Bitte versuche ein anderes Bild oder einen anderen Prompt.",
          details: { errorId },
        });
      }
      return jsonResponse(502, {
        success: false,
        error: "Gemini request failed",
        details: { errorId, status: aiResponse.status },
      });
    }

    const aiData = await aiResponse.json();

    // Extract image from Gemini native response shape
    const candidateParts = aiData?.candidates?.[0]?.content?.parts ?? [];
    let editedImageUrl: string | null = null;
    for (const part of candidateParts) {
      const inline = part?.inline_data ?? part?.inlineData;
      if (inline?.data) {
        const mimeType = inline.mime_type ?? inline.mimeType ?? "image/png";
        editedImageUrl = `data:${mimeType};base64,${inline.data}`;
        break;
      }
    }

    if (!editedImageUrl) {
      console.error("No image in Gemini response:", { errorId, preview: JSON.stringify(aiData).slice(0, 600) });
      return jsonResponse(502, {
        success: false,
        error: "Gemini hat kein bearbeitetes Bild zurückgegeben. Bitte versuche es erneut.",
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
      model: usedModel,
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
