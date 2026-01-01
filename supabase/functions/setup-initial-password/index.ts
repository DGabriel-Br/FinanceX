import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SETUP-INITIAL-PASSWORD] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const { token, password } = await req.json();
    if (!token || !password) {
      throw new Error("token and password are required");
    }
    logStep("Received token and password");

    // Validate password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_setup_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      logStep("Token not found", { error: tokenError?.message });
      throw new Error("Invalid token");
    }

    if (tokenData.used_at) {
      logStep("Token already used");
      throw new Error("This link has already been used");
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      logStep("Token expired");
      throw new Error("This link has expired");
    }

    logStep("Token validated", { userId: tokenData.user_id, email: tokenData.email });

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { 
        password,
        user_metadata: { needs_password_setup: false }
      }
    );

    if (updateError) {
      logStep("Failed to update password", { error: updateError.message });
      throw new Error("Failed to update password");
    }

    logStep("Password updated successfully");

    // Mark token as used
    await supabase
      .from("password_setup_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    logStep("Token marked as used");

    return new Response(
      JSON.stringify({ email: tokenData.email, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
