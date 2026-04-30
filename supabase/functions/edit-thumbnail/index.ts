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
  quick: `You are a world-class YouTube thumbnail designer. Apply fast, high-impact improvements:
- Boost contrast and saturation for maximum "pop"
- Sharpen the main subject to 8k level details
- Add professional vignette to draw the eye to the center
- Make colors vibrant and "clicky"
Keep it clean but make it stand out in a busy feed. Maintain composition.`,

  pro: `You are a legendary YouTube designer for MrBeast. Create a multi-thousand dollar thumbnail:
- Epic cinematic color grading (Teal & Orange or dramatic palettes)
- Dramatic volumetric lighting, god rays, and glowing rim lights
- Massive subject-background separation with professional bokeh/blur
- High-end glow effects on items and characters (magical, glowing, neon)
- Atmosphere: Add dust particles, sparks, embers, and lens flares
- Bold, saturated colors optimized for maximum Click-Through-Rate (CTR)
- Perfect sharp edges and professional digital painting finish
- The final result must look like a Hollywood movie poster.`,

  background: `You are a background artist for AAA games.
- Generate an epic, detailed background that tells a story
- Use atmospheric perspective (fog, depth, mountains)
- Add dramatic sky, explosions, or futuristic cityscapes
- Use complementary colors to make the foreground "pop" like crazy
- Add volumetric light rays hitting the scene
Keep the foreground subject exactly as-is. Transform the background into a masterpiece.`,

  character: `You are a character designer for high-end cinematic trailers.
- Add dramatic Rim Lighting (Lichterkante) to separate character from background
- Enhance facial expressions to be 10x more expressive and dramatic
- Add energy effects: lightning, fire, auras, or magical glows
- Enhance armor and clothes with professional textures and reflections
- Add action lines and subtle motion blur for a dynamic "frozen in time" look
Keep the background stable. Make the characters look like legendary heroes.`,

  enhance: `You are a YouTube CTR optimization expert.
- Maximize the visual "hook" of the image
- Apply professional 3-point lighting enhancement
- Cinematic "Teal and Orange" or "High Contrast" color grading
- Strengthen visual hierarchy (what to look at first, second, third)
- Add "Premium" polish: Subtle grain, sharp details, atmospheric depth
- Ensure the thumbnail looks perfect even on small mobile screens
The goal is to make this image impossible NOT to click.`,
};

const stylePrompts: Record<string, string> = {
  allrounder: "Professional all-rounder style, clean, balanced, high quality.",
  gaming: "Hardcore gaming aesthetic, high contrast, rim lighting, neon accents, intense action feel, saturation boost.",
  minecraft: "Minecraft-specific optimization, vibrant blocks, soft shaders look, epic sky, glowing items, clean UI elements.",
  vlog: "Clean vlog aesthetic, bright and airy, natural skin tones, high-end bokeh, lifestyle photography quality, minimal but polished.",
  business: "Professional business/authority look, minimalist, sharp focus, clean backgrounds, high-trust colors, corporate but modern.",
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
      version: "2026-04-29-GEMINI-ULTRA-DESIGNER",
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
    const style = typeof body?.style === "string" ? body.style : "allrounder";
    const referenceImageUrl = body?.referenceImageUrl;

    console.log("edit-thumbnail request:", { errorId, hasImage: !!imageUrl, hasPrompt: !!prompt, mode, style });

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

    // --- ENGINE 1: GEMINI (The "5000€ Designer" Choice) ---
    const styleText = stylePrompts[style] || stylePrompts.allrounder;
    const systemPrompt = modeSystemPrompts[mode];
    const userText = `Style: ${styleText}\nInstruction: ${prompt}\n\nIMPORTANT: Generate a high-end YouTube thumbnail. Use cinematic lighting, rim lights, and vibrant colors. Target aspect ratio 16:9. Make it look professional and clickworthy.`;

    let mainImage: { data: string; mimeType: string };
    try {
      mainImage = await imageToBase64(imageUrl);
      
      const parts: any[] = [
        { text: `${systemPrompt}\n\n${userText}` },
        { inline_data: { mime_type: mainImage.mimeType, data: mainImage.data } }
      ];

      // Try Gemini models
      const geminiModels = ["gemini-2.0-flash-exp", "gemini-1.5-flash"];
      for (const model of geminiModels) {
        console.log(`[${errorId}] Trying Gemini: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
        
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts }],
              generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
          });

          if (response.ok) {
            const aiData = await response.json();
            const candidateParts = aiData?.candidates?.[0]?.content?.parts ?? [];
            for (const part of candidateParts) {
              const inline = part?.inline_data ?? part?.inlineData;
              if (inline?.data) {
                // SUCCESS WITH GEMINI
                const mimeType = inline.mime_type ?? inline.mimeType ?? "image/png";
                const editedImageUrl = `data:${mimeType};base64,${inline.data}`;
                
                // Deduct credits
                await supabaseClient.from("profiles").update({ credits: Math.max(0, profile.credits - cost) }).eq("user_id", user.id);

                return jsonResponse(200, {
                  success: true,
                  imageUrl: editedImageUrl,
                  mode,
                  style,
                  model: model,
                  creditsSpent: cost,
                  creditsRemaining: Math.max(0, profile.credits - cost),
                });
              }
            }
          }
        } catch (err) { console.warn(`Gemini ${model} failed, trying next...`, err); }
      }
    } catch (e) {
      console.warn("Gemini setup failed, jumping to FLUX fallback:", e);
    }

    // --- ENGINE 2: FLUX FALLBACK (Always works, keeps the service running) ---
    console.log(`[${errorId}] Gemini failed/limited. Using Fallback: FLUX`);
    
    const fluxPrompt = encodeURIComponent(`Masterpiece YouTube thumbnail, ${styleText}, ${modeSystemPrompts[mode]}, ${prompt}, 8k, ultra-detailed, high contrast, cinematic lighting, vibrant colors, epic composition, 16:9, professional digital art, trending on artstation, masterpiece, best quality.`);
    const fluxUrl = `https://image.pollinations.ai/prompt/${fluxPrompt}?model=flux&width=1280&height=720&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;

    try {
      await supabaseClient
        .from("profiles")
        .update({ credits: Math.max(0, profile.credits - cost) })
        .eq("user_id", user.id);

      return jsonResponse(200, {
        success: true,
        imageUrl: fluxUrl,
        mode,
        style,
        model: "flux-fallback",
        creditsSpent: cost,
        creditsRemaining: Math.max(0, profile.credits - cost),
      });
    } catch (e) {
      return jsonResponse(500, { success: false, error: "AI Engines currently unavailable." });
    }
  } catch (e) {
    const errorId = createErrorId();
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("edit-thumbnail unhandled error:", { errorId, message });
    return jsonResponse(500, { success: false, error: message, details: { errorId } });
  }
});
