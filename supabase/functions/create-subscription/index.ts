import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const body = await req.json();
    const { customerId, paymentMethodId } = body;

    if (!customerId || !paymentMethodId) {
      throw new Error("customerId and paymentMethodId are required");
    }

    logStep("Request body parsed", { customerId, paymentMethodId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Attach payment method to customer and set as default
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    logStep("Payment method attached to customer");

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    logStep("Default payment method set");

    // Create subscription with 3-day trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: "price_1SkYlU1qJqkZgiRaCWyFWo0u" }],
      trial_period_days: 3,
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice"],
    });

    logStep("Subscription created", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      trialEnd: subscription.trial_end 
    });

    return new Response(JSON.stringify({ 
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
