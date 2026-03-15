import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

type EditMode = "quick" | "pro" | "background" | "character" | "enhance";

const modeConfig: Record<EditMode, { model: string; systemPrompt: string }> = {
  quick: {
    model: "google/gemini-3.1-flash-image-preview",
    systemPrompt: `You are a YouTube thumbnail editor. Apply fast, impactful improvements:
- Boost contrast and saturation by ~20%
- Sharpen the main subject
- Add subtle vignette for focus
- Make colors pop more
Keep the edit subtle but noticeable. Maintain the original composition exactly.`,
  },
  pro: {
    model: "google/gemini-3-pro-image-preview",
    systemPrompt: `You are an elite YouTube thumbnail designer who creates thumbnails for channels with 10M+ subscribers.
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
  },
  background: {
    model: "google/gemini-3-pro-image-preview",
    systemPrompt: `You are a background specialist for YouTube thumbnails.
Focus exclusively on improving the background:
- Generate epic, dramatic backgrounds that complement the foreground subject
- Add depth with atmospheric perspective, fog, or particle effects
- Create dramatic skies, explosions, or environmental effects
- Use complementary colors that make the foreground subject pop
- Add volumetric lighting and god rays
- Ensure the background supports the thumbnail's story without distracting from the subject
Keep the foreground subject exactly as-is. Only transform the background.`,
  },
  character: {
    model: "google/gemini-3-pro-image-preview",
    systemPrompt: `You are a character enhancement specialist for gaming YouTube thumbnails.
Focus on making characters and objects look more impressive:
- Add dynamic glow and rim lighting to characters
- Enhance armor, weapons, and items with shiny/reflective effects
- Add energy effects, auras, or power-up glows
- Improve facial expressions to be more dramatic/expressive
- Add motion blur or action lines for dynamic poses
- Make items look legendary/epic quality with golden glows or enchantment effects
Keep the background and overall composition unchanged. Only enhance the characters and objects.`,
  },
  enhance: {
    model: "google/gemini-3-pro-image-preview",
    systemPrompt: `You are a YouTube thumbnail optimization expert who maximizes click-through rate.
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
  },
};

const isValidImageInput = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (value.startsWith("https://") || value.startsWith("http://")) return true;
  if (value.startsWith("data:image/")) return true;
  return false;
};

const extractImageUrlFromAiResponse = (data: any): string | null => {
  const directImage = data?.choices?.[0]?.message?.images?.[0]?.image_url;
  if (typeof directImage === "string") return directImage;
  if (typeof directImage?.url === "string") return directImage.url;

  const content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part?.type === "image_url") {
        if (typeof part?.image_url === "string") return part.image_url;
        if (typeof part?.image_url?.url === "string") return part.image_url.url;
      }
      if (part?.type === "output_image" && typeof part?.image_url === "string") {
        return part.image_url;
      }
    }
  }

  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const mode: EditMode = (body?.mode && modeConfig[body.mode]) ? body.mode : "quick";
    const referenceImageUrl = body?.referenceImageUrl;

    console.log("edit-thumbnail request body summary:", {
      hasBody: !!body,
      hasImageUrl: !!imageUrl,
      hasPrompt: !!prompt,
      mode,
      hasReferenceImageUrl: !!referenceImageUrl,
    });

    if (!imageUrl || !prompt) {
      return jsonResponse(400, {
        success: false,
        error: "Missing required fields",
        details: {
          required: ["imageUrl", "prompt"],
          received: {
            hasImageUrl: !!imageUrl,
            hasPrompt: !!prompt,
          },
        },
      });
    }

    if (!isValidImageInput(imageUrl)) {
      return jsonResponse(400, {
        success: false,
        error: "A valid imageUrl is required",
      });
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const aiKey = GOOGLE_API_KEY || LOVABLE_API_KEY || OPENAI_API_KEY;
    const missingEnv: string[] = [];
    if (!aiKey) missingEnv.push("GOOGLE_API_KEY (or LOVABLE_API_KEY / OPENAI_API_KEY)");
    if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

    if (missingEnv.length > 0) {
      console.error("edit-thumbnail missing env vars:", missingEnv);
      return jsonResponse(500, {
        success: false,
        error: "Server configuration error: missing environment variables",
        details: { missingEnv },
      });
    }

    const config = modeConfig[mode];

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: "system",
              content: config.systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: isValidImageInput(referenceImageUrl)
                    ? `Edit this YouTube thumbnail based on the reference image I'm providing: ${prompt}`
                    : `Edit this YouTube thumbnail: ${prompt}`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
                ...(isValidImageInput(referenceImageUrl)
                  ? [{ type: "image_url" as const, image_url: { url: referenceImageUrl } }]
                  : []),
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("AI image edit network error:", message);
      return jsonResponse(502, {
        success: false,
        error: "AI image edit network error",
        details: { message },
      });
    }

    console.log("edit-thumbnail AI response status:", response.status);

    if (!response.ok) {
      const gatewayError = await response.text();
      console.error("AI image edit error:", response.status, gatewayError);

      if (response.status === 429) {
        return jsonResponse(429, {
          success: false,
          error: "Rate limit exceeded. Please wait a moment and try again.",
        });
      }
      if (response.status === 402) {
        return jsonResponse(402, {
          success: false,
          error: "AI credits exhausted. Please add funds.",
        });
      }

      return jsonResponse(502, {
        success: false,
        error: "AI image edit request failed",
        details: gatewayError.slice(0, 500),
      });
    }

    const data = await response.json().catch((parseError) => {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("edit-thumbnail AI JSON parse error:", message);
      throw new Error("Failed to parse AI response JSON");
    });
    const editedImageUrl = extractImageUrlFromAiResponse(data);

    if (!editedImageUrl) {
      console.error("No image in AI response", JSON.stringify(data).slice(0, 1000));
      return jsonResponse(502, {
        success: false,
        error: "No edited image returned by AI",
      });
    }

    return jsonResponse(200, {
      success: true,
      imageUrl: editedImageUrl,
      mode,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("edit-thumbnail unhandled error:", message);
    return jsonResponse(500, {
      success: false,
      error: message,
    });
  }
});
