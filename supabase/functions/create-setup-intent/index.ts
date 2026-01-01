import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SETUP-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body for email (for unauthenticated users)
    let userEmail: string | undefined;
    let customerId: string | undefined;

    const body = await req.json().catch(() => ({}));
    const providedEmail = body.email;

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user?.email) {
        userEmail = user.email;
        logStep("User authenticated", { email: userEmail });
      }
    }

    // Use provided email if no authenticated user
    if (!userEmail && providedEmail) {
      userEmail = providedEmail;
      logStep("Using provided email", { email: userEmail });
    }

    if (!userEmail) {
      throw new Error("Email is required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists, create if not
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({ email: userEmail });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create SetupIntent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: {
        email: userEmail,
      },
    });

    logStep("SetupIntent created", { setupIntentId: setupIntent.id });

    return new Response(JSON.stringify({ 
      clientSecret: setupIntent.client_secret,
      customerId: customerId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-setup-intent", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
