import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-SETUP-TOKEN] ${step}${detailsStr}`);
};

// Helper to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic to find token - handles race condition with webhook
async function findTokenWithRetry(
  supabase: any,
  email: string,
  maxRetries = 5,
  delayMs = 2000
): Promise<{ token: string; email: string } | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logStep(`Token lookup attempt ${attempt}/${maxRetries}`, { email });
    
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_setup_tokens")
      .select("token, email")
      .eq("email", email)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (tokenData && !tokenError) {
      logStep("Token found", { attempt, email });
      return tokenData;
    }

    if (attempt < maxRetries) {
      logStep(`Token not found, waiting ${delayMs}ms before retry`, { attempt });
      await sleep(delayMs);
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const body = await req.json();
    const { session_id, token: directToken } = body;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // CASE 1: Direct token access (from resend email link)
    if (directToken) {
      logStep("Direct token access", { token: directToken });
      
      const { data: tokenData, error: tokenError } = await supabase
        .from("password_setup_tokens")
        .select("token, email, expires_at, used_at")
        .eq("token", directToken)
        .single();

      if (tokenError || !tokenData) {
        logStep("Direct token not found", { error: tokenError?.message });
        return new Response(
          JSON.stringify({ error: "Token não encontrado.", status: "not_found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (tokenData.used_at) {
        logStep("Token already used");
        return new Response(
          JSON.stringify({ error: "Este link já foi utilizado.", status: "used" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        logStep("Token expired");
        return new Response(
          JSON.stringify({ 
            error: "Este link expirou. Solicite um novo link.", 
            status: "expired",
            email: tokenData.email 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      logStep("Direct token valid");
      return new Response(
        JSON.stringify({ token: tokenData.token, email: tokenData.email, status: "found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // CASE 2: Session ID access (from Stripe checkout)
    if (!session_id) {
      throw new Error("session_id ou token é obrigatório");
    }
    logStep("Session ID access", { session_id });

    // Get email from Stripe checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    const email = session.customer_details?.email || session.customer_email;
    if (!email) {
      throw new Error("No email found in checkout session");
    }
    logStep("Found email from Stripe", { email });

    // Check if user already exists and has password set (not needs_password_setup)
    const { data: userData } = await supabase.auth.admin.listUsers();
    const existingUser = userData?.users?.find(u => u.email === email);
    
    if (existingUser && !existingUser.user_metadata?.needs_password_setup) {
      logStep("User exists with password already set, redirecting to login");
      return new Response(
        JSON.stringify({ 
          status: "existing_user",
          message: "Você já possui uma conta. Faça login para continuar."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get valid token with retry (handles race condition with webhook)
    const tokenData = await findTokenWithRetry(supabase, email);

    if (!tokenData) {
      logStep("Token not found after all retries", { email });
      return new Response(
        JSON.stringify({ 
          error: "Token não encontrado. O processamento ainda pode estar em andamento.",
          status: "pending",
          email
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 }
      );
    }

    logStep("Token found successfully");
    return new Response(
      JSON.stringify({ token: tokenData.token, email: tokenData.email, status: "found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, status: "error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
