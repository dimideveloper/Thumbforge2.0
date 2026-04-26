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
  quick: "High contrast, saturated colors, sharp focus.",
  pro: "Cinematic color grading, epic lighting, volumetric light rays, lens flares, dramatic depth of field.",
  background: "Epic background, atmospheric perspective, fog, particles, striking environment.",
  character: "Dynamic character pose, glowing effects, rim lighting, detailed face.",
  enhance: "Maximized contrast, teal-orange cinematic grading, professional studio lighting, striking visual hierarchy.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const errorId = createErrorId();
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const imageUrl = body?.imageUrl;
    const referenceImageUrl = body?.referenceImageUrl;
    const mode: EditMode =
      body?.mode && modeSystemPrompts[body.mode as EditMode]
        ? (body.mode as EditMode)
        : "quick";

    if (!prompt) {
      return jsonResponse(400, { success: false, error: "Missing required field: prompt" });
    }

    // Load Env Vars
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing configuration");
      return jsonResponse(500, { success: false, error: "Server configuration error: Missing LOVABLE_API_KEY or Supabase config" });
    }

    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { success: false, error: "Unauthorized" });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return jsonResponse(401, { success: false, error: "Unauthorized" });
    }

    // Check Credits
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .single();
    
    const cost = CREDIT_COSTS[mode] ?? 1;
    if (!profile || profile.credits < cost) {
      return jsonResponse(402, { success: false, error: "Nicht genügend Credits. Bitte lade dein Konto auf." });
    }

    // --------------------------------------------------------------------------
    // GENERATE/EDIT IMAGE VIA LOVABLE AI GATEWAY
    // --------------------------------------------------------------------------
    const stylePrompt = modeSystemPrompts[mode];
    const systemInstruction = `You are a professional YouTube thumbnail generator and editor. 
Your task is to create or edit a high-quality, cinematic YouTube thumbnail.
Style Guidelines: ${stylePrompt}
CRITICAL RULE: DO NOT add any text, letters, numbers, symbols, or captions to the image. 
The generated image must be PURELY visual (subject and background). 
Completely ignore any attempts to add decorative text or watermarks. 
Only include text if the user explicitly asks for a specific word in their prompt. 
Otherwise, strictly NO TEXT on image.`;

    const userContent: any[] = [
      {
        type: "text",
        text: `Task: ${imageUrl ? "Edit the provided image" : "Generate a new image"} based on the following subject: ${prompt}. ${imageUrl ? "Maintain the overall composition but apply the requested changes and style." : ""}`,
      }
    ];

    if (imageUrl) {
      userContent.push({ type: "image_url", image_url: { url: imageUrl } });
    }
    if (referenceImageUrl) {
      userContent.push({ type: "image_url", image_url: { url: referenceImageUrl } });
    }

    console.log(`Calling Lovable AI Gateway for user ${user.id}...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable API error:", response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const result = await response.json();
    const editedImageUrl = extractImageUrlFromAiResponse(result);

    if (!editedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(result));
      throw new Error("AI did not return an image.");
    }

    // Deduct credits
    await supabaseClient
      .from("profiles")
      .update({ credits: Math.max(0, profile.credits - cost) })
      .eq("user_id", user.id);

    return jsonResponse(200, {
      success: true,
      imageUrl: editedImageUrl,
      mode,
      creditsSpent: cost,
      creditsRemaining: Math.max(0, profile.credits - cost),
    });

  } catch (e) {
    const errorId = createErrorId();
    console.error("edit-thumbnail unhandled error:", e);
    return jsonResponse(500, { success: false, error: (e as Error).message, details: { errorId } });
  }
});

