import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    console.log("Whop Webhook received:", JSON.stringify(payload, null, 2));

    const event = payload.action; // "membership.went_valid" or "membership.went_invalid"
    const membership = payload.data;
    const planId = membership?.plan_id || membership?.plan?.id;

    if (!membership || !membership.user) {
      return new Response(JSON.stringify({ error: "No user data found in webhook" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = membership.user.email;
    const isPro = event === "membership.went_valid";

    if (!email) {
       return new Response(JSON.stringify({ error: "No email resolved for user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${event} for ${email} (Plan: ${planId})`);

    // Find profile
    const { data: profile, error: searchError } = await supabaseClient
      .from("profiles")
      .select("id, credits")
      .eq("email", email)
      .maybeSingle();

    if (searchError) {
      console.error("Error finding user:", searchError);
       return new Response(JSON.stringify({ error: "Failed to query user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      console.log(`User with email ${email} not found in DB.`);
      return new Response(JSON.stringify({ message: "User not found, skipping sync" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine plan and credits
    let planName = "free";
    let creditsToGrant = 5;

    if (isPro) {
      if (planId === "plan_lj2lAPEbLwxH5") {
        planName = "starter";
        creditsToGrant = 50;
      } else if (planId === "plan_C53jPL5MeUWxg") {
        planName = "pro";
        creditsToGrant = 200;
      } else if (planId === "plan_OAZXDwdWr2Xs9") {
        planName = "premium";
        creditsToGrant = 999999;
      } else {
        // Fallback for unknown plans
        planName = "pro";
        creditsToGrant = 100;
      }
    }

    console.log(`Updating ${email}: plan=${planName}, credits=${creditsToGrant}`);

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        is_pro: isPro && planName !== "free",
        plan: planName,
        credits: creditsToGrant,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
       return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: `Updated ${email} to ${planName}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
