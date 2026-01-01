import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Gera uma senha temporária segura
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Garantir que tem todos os requisitos
  return password + 'Aa1!';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    
    logStep("Keys verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response(JSON.stringify({ error: "No signature" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Event verified", { type: event.type, id: event.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Signature verification failed", { message: errorMessage });
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          subscriptionId: session.subscription,
          customerEmail: session.customer_email || session.customer_details?.email
        });

        if (session.mode === "subscription" && session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
          const customerEmail = customer.email || session.customer_email || session.customer_details?.email;
          
          if (!customerEmail) {
            logStep("ERROR: No customer email found");
            break;
          }

          logStep("Processing checkout for email", { email: customerEmail });

          // Verificar se usuário já existe
          const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
          if (userError) {
            logStep("ERROR: Failed to list users", { error: userError.message });
            break;
          }
          
          let user = userData.users.find(u => u.email === customerEmail);
          
          // Se usuário não existe, criar automaticamente
          if (!user) {
            logStep("User not found, creating new user", { email: customerEmail });
            
            const tempPassword = generateTempPassword();
            const customerName = customer.name || session.customer_details?.name || customerEmail.split('@')[0];
            
            const { data: newUserData, error: createError } = await supabaseClient.auth.admin.createUser({
              email: customerEmail,
              password: tempPassword,
              email_confirm: true, // Auto-confirma o email
              user_metadata: {
                full_name: customerName,
                needs_password_setup: true, // Flag para indicar que precisa definir senha
                stripe_customer_id: session.customer as string
              }
            });

            if (createError) {
              logStep("ERROR: Failed to create user", { error: createError.message });
              break;
            }

            user = newUserData.user;
            logStep("User created successfully", { userId: user.id, email: customerEmail });
          } else {
            logStep("User already exists", { userId: user.id, email: customerEmail });
            
            // Atualizar metadata do usuário existente com o customer_id
            await supabaseClient.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                stripe_customer_id: session.customer as string
              }
            });
          }

          // Criar/atualizar subscription
          const subscriptionData = {
            user_id: user.id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price?.id || null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          };

          const { error: upsertError } = await supabaseClient
            .from("subscriptions")
            .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

          if (upsertError) {
            logStep("ERROR: Failed to upsert subscription", { error: upsertError.message });
          } else {
            logStep("Subscription created/updated", { subscriptionId: session.subscription, userId: user.id });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { 
          type: event.type,
          subscriptionId: subscription.id, 
          status: subscription.status 
        });

        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        if (customer.email) {
          const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
          if (userError) {
            logStep("ERROR: Failed to list users", { error: userError.message });
            break;
          }
          
          const user = userData.users.find(u => u.email === customer.email);
          if (!user) {
            logStep("User not found for subscription update, skipping", { email: customer.email });
            break;
          }

          const subscriptionData = {
            user_id: user.id,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price?.id || null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          };

          const { error: upsertError } = await supabaseClient
            .from("subscriptions")
            .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

          if (upsertError) {
            logStep("ERROR: Failed to upsert subscription", { error: upsertError.message });
          } else {
            logStep("Subscription updated in database", { subscriptionId: subscription.id, status: subscription.status });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update({ 
            status: "canceled",
            canceled_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          logStep("ERROR: Failed to update subscription status", { error: updateError.message });
        } else {
          logStep("Subscription marked as canceled", { subscriptionId: subscription.id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment succeeded", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          const { error: updateError } = await supabaseClient
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (updateError) {
            logStep("ERROR: Failed to update subscription after payment", { error: updateError.message });
          } else {
            logStep("Subscription updated after payment", { subscriptionId: invoice.subscription });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        
        if (invoice.subscription) {
          const { error: updateError } = await supabaseClient
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (updateError) {
            logStep("ERROR: Failed to update subscription status to past_due", { error: updateError.message });
          } else {
            logStep("Subscription marked as past_due", { subscriptionId: invoice.subscription });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});