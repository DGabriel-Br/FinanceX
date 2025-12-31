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

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | undefined;
    let customerId: string | undefined;
    let userName: string | undefined;

    // Check if user is authenticated
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (user?.email) {
        userEmail = user.email;
        userName = user.user_metadata?.full_name || user.user_metadata?.name;
        logStep("User authenticated", { email: userEmail, name: userName });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });

        // Check if user already has an active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          logStep("User already has active subscription");
          return new Response(
            JSON.stringify({ 
              error: "Você já possui uma assinatura ativa",
              hasActiveSubscription: true 
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }

        // Check for trialing subscription
        const trialingSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "trialing",
          limit: 1,
        });

        if (trialingSubscriptions.data.length > 0) {
          logStep("User already has trialing subscription");
          return new Response(
            JSON.stringify({ 
              error: "Você já está no período de teste",
              hasActiveSubscription: true 
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
      }
    }

    const origin = req.headers.get("origin") || "https://financex.lovable.app";

    // Create subscription checkout session with 3-day trial and enhanced options
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      customer_creation: customerId ? undefined : "always",
      line_items: [
        {
          price: "price_1SkYlU1qJqkZgiRaCWyFWo0u",
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          user_email: userEmail || "",
        },
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
        required: "if_supported",
      },
      custom_text: {
        submit: {
          message: "Seu período de teste gratuito de 3 dias começa agora. Você só será cobrado após o término do teste.",
        },
        terms_of_service_acceptance: {
          message: "Ao continuar, você concorda com nossos [Termos de Serviço](https://financex.lovable.app/termos).",
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
      locale: "pt-BR",
      payment_method_types: ["card"],
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      trialDays: 3 
    });

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