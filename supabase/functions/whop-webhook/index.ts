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

    console.log(`Updating user ${email}: is_pro = ${isPro}`);

    // Update profile by email instead of ID directly because Whop sends the email
    // Ideally, users sign up with the same email used for Whop.
    const { data: profile, error: searchError } = await supabaseClient
      .from("profiles")
      .select("id")
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
      console.log(`User with email ${email} not found in DB. Need to create user first or await login.`);
      // Depending on flow: you might want to create a shadow user here if they haven't signed up yet. 
      // For now, we return 200 so Whop doesn't keep retrying. 
      return new Response(JSON.stringify({ message: "User not found, skipping sync" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        is_pro: isPro,
        plan: isPro ? "pro" : "free",
        credits: isPro ? 999999 : 5, // give "unlimited" or base credits depending on plan
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
       return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: `Updated ${email} pro status` }), {
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
