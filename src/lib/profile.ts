import { supabase } from "@/integrations/supabase/client";

export const getOrCreateProfileCredits = async (userId: string): Promise<number> => {
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.warn("Profile fetch warning:", fetchError.message);
  }

  if (existingProfile) {
    return existingProfile.credits;
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({ user_id: userId })
    .select("credits")
    .maybeSingle();

  if (!insertError && insertedProfile) {
    return insertedProfile.credits;
  }

  if (insertError) {
    // Handle race condition where profile was created by another request in parallel.
    const { data: retryProfile, error: retryError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (!retryError && retryProfile) {
      return retryProfile.credits;
    }

    console.error("Profile creation failed:", insertError.message);
  }

  return 0;
};
