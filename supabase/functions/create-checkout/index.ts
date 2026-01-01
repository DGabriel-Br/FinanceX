import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let customerId: string | undefined;
    let isExistingUserWithPassword = false;

    // Check if user is authenticated
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user?.email) {
        userEmail = user.email;
        isExistingUserWithPassword = !user.user_metadata?.needs_password_setup;
        logStep("User authenticated", { email: userEmail, isExistingUserWithPassword });
      }
    }

    // Check if customer exists in Stripe
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });

        // Check if customer already has an active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        const trialingSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: "trialing",
          limit: 1,
        });

        if (subscriptions.data.length > 0 || trialingSubs.data.length > 0) {
          const activeSub = subscriptions.data[0] || trialingSubs.data[0];
          logStep("Customer already has active subscription", { 
            subscriptionId: activeSub.id, 
            status: activeSub.status 
          });

          // Create portal session for existing subscribers
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.get("origin") || "https://financex.lovable.app"}/dashboard`,
          });

          return new Response(JSON.stringify({ 
            error: "already_subscribed",
            message: "Você já possui uma assinatura ativa.",
            portal_url: portalSession.url
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      }
    }

    const origin = req.headers.get("origin") || "https://financex.lovable.app";

    // Determine success URL based on whether user already has a password
    const successUrl = isExistingUserWithPassword 
      ? `${origin}/dashboard?checkout=success`
      : `${origin}/setup-password?session_id={CHECKOUT_SESSION_ID}`;

    logStep("Creating checkout session", { successUrl, isExistingUserWithPassword });

    // Create subscription checkout session with 3-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: "price_1SkYlU1qJqkZgiRaCWyFWo0u",
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 3,
      },
      success_url: successUrl,
      cancel_url: `${origin}/?checkout=canceled`,
      billing_address_collection: "auto",
      locale: "pt-BR",
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
