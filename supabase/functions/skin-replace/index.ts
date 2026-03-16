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

const isValidImageInput = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  return value.startsWith("https://") || value.startsWith("http://") || value.startsWith("data:image/");
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
    const thumbnailUrl = body?.thumbnailUrl;
    const skinUrl = body?.skinUrl;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    console.log("skin-replace request body summary:", {
      hasBody: !!body,
      hasThumbnailUrl: !!thumbnailUrl,
      hasSkinUrl: !!skinUrl,
      hasPrompt: !!prompt,
    });

    if (!thumbnailUrl || !skinUrl) {
      return jsonResponse(400, {
        success: false,
        error: "Missing required fields",
        details: {
          required: ["thumbnailUrl", "skinUrl"],
          received: {
            hasThumbnailUrl: !!thumbnailUrl,
            hasSkinUrl: !!skinUrl,
          },
        },
      });
    }

    if (!isValidImageInput(thumbnailUrl)) {
      return jsonResponse(400, {
        success: false,
        error: "A valid thumbnailUrl is required",
      });
    }

    if (!isValidImageInput(skinUrl)) {
      return jsonResponse(400, {
        success: false,
        error: "A valid skinUrl is required",
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const aiKey = LOVABLE_API_KEY;
    const missingEnv: string[] = [];
    if (!aiKey) missingEnv.push("LOVABLE_API_KEY");
    if (!SUPABASE_URL) missingEnv.push("SUPABASE_URL");
    if (!SUPABASE_SERVICE_ROLE_KEY) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY");

    if (missingEnv.length > 0) {
      console.error("skin-replace missing env vars:", missingEnv);
      return jsonResponse(500, {
        success: false,
        error: "Server configuration error: missing environment variables",
        details: { missingEnv },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Missing Authorization header" });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (userError || !user) {
      return jsonResponse(401, { success: false, error: "Unauthorized: Invalid token" });
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse(500, { success: false, error: "Failed to load user profile" });
    }

    if (profile.credits <= 0) {
      return jsonResponse(402, { success: false, error: "Nicht genügend Credits. Bitte lade dein Konto auf." });
    }

    const systemPrompt = `You are a professional Minecraft thumbnail editor specializing in skin replacement.

CRITICAL OUTPUT RULES:
- The output image MUST have the EXACT same dimensions and aspect ratio as the FIRST input image (the thumbnail).
- The thumbnail is a 16:9 YouTube thumbnail. Your output MUST also be 16:9 landscape format.
- Do NOT crop, resize, or reframe the image in any way.
- Do NOT output a portrait or square image.
- Do NOT zoom in on the character.
- The entire original scene must remain fully visible in the output.

Your task: Replace ONLY the Minecraft character's skin/texture in the thumbnail with the skin from the second image.
Rules:
- Keep the exact same pose, position, angle, scale, and proportions of the character
- Only change the skin/texture of the character to match the provided skin image
- Maintain ALL other elements (background, lighting, effects, text, objects) exactly as they are
- The replacement should look natural and seamless
- Preserve the overall style, quality, and composition of the thumbnail
- The character must remain at the same size and position within the frame
${prompt ? `Additional instructions: ${prompt}` : ""}`;

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Replace the Minecraft character skin in this thumbnail with the skin shown in the second image. OUTPUT THE FULL THUMBNAIL at the exact same dimensions and 16:9 aspect ratio. Do not crop or zoom. Keep the entire background and scene intact. Only change the character's skin texture.",
                },
                { type: "image_url", image_url: { url: thumbnailUrl } },
                { type: "image_url", image_url: { url: skinUrl } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("AI skin-replace network error:", message);
      return jsonResponse(502, {
        success: false,
        error: "AI skin replacement network error",
        details: { message },
      });
    }

    console.log("skin-replace AI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI skin-replace error:", response.status, errorText);

      if (response.status === 429) {
        return jsonResponse(429, {
          success: false,
          error: "Rate limit erreicht. Bitte kurz warten.",
        });
      }
      if (response.status === 402) {
        return jsonResponse(402, {
          success: false,
          error: "AI Credits aufgebraucht.",
        });
      }

      return jsonResponse(502, {
        success: false,
        error: "AI skin replacement failed",
        details: errorText.slice(0, 500),
      });
    }

    const data = await response.json().catch((parseError) => {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      console.error("skin-replace AI JSON parse error:", message);
      throw new Error("Failed to parse AI response JSON");
    });
    const editedImageUrl = extractImageUrlFromAiResponse(data);

    if (!editedImageUrl) {
      console.error("No image in AI response", JSON.stringify(data).slice(0, 1000));
      return jsonResponse(502, {
        success: false,
        error: "Kein bearbeitetes Bild zurückgegeben",
      });
    }

    // Deduct 1 credit upon success
    const { error: deductError } = await supabaseClient
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Failed to deduct credit:", deductError);
    }

    return jsonResponse(200, {
      success: true,
      imageUrl: editedImageUrl,
      creditsSpent: 1,
      creditsRemaining: Math.max(0, profile.credits - 1),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("skin-replace unhandled error:", message);
    return jsonResponse(500, {
      success: false,
      error: message,
    });
  }
});
