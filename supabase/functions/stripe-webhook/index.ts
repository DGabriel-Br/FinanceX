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

            // Create password setup token for frictionless password setup
            const { error: tokenError } = await supabaseClient
              .from("password_setup_tokens")
              .insert({
                user_id: user.id,
                email: customerEmail,
                stripe_session_id: session.id,
              });

            if (tokenError) {
              logStep("ERROR: Failed to create setup token", { error: tokenError.message });
            } else {
              logStep("Password setup token created", { userId: user.id, sessionId: session.id });

              // Enviar email de boas-vindas
              try {
                const welcomeEmailResponse = await fetch(
                  `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                    },
                    body: JSON.stringify({
                      email: customerEmail,
                      sessionId: session.id,
                      userName: customer.name || session.customer_details?.name,
                    }),
                  }
                );
                
                if (welcomeEmailResponse.ok) {
                  logStep("Welcome email sent successfully", { email: customerEmail });
                  
                  // Agendar email de lembrete para 24h depois
                  try {
                    const reminderDate = new Date();
                    reminderDate.setHours(reminderDate.getHours() + 24);
                    
                    const { error: scheduleError } = await supabaseClient
                      .from("scheduled_emails")
                      .insert({
                        user_id: user.id,
                        email: customerEmail,
                        email_type: "reminder_24h",
                        scheduled_for: reminderDate.toISOString(),
                        metadata: { 
                          stripe_session_id: session.id,
                          customer_name: customer.name || session.customer_details?.name 
                        }
                      });
                    
                    if (scheduleError) {
                      logStep("WARNING: Failed to schedule reminder email", { error: scheduleError.message });
                    } else {
                      logStep("Reminder email scheduled for 24h", { email: customerEmail, scheduledFor: reminderDate.toISOString() });
                    }
                    
                    // Agendar email de trial expirando para 48h depois
                    const trialExpiringDate = new Date();
                    trialExpiringDate.setHours(trialExpiringDate.getHours() + 48);
                    
                    const { error: trialScheduleError } = await supabaseClient
                      .from("scheduled_emails")
                      .insert({
                        user_id: user.id,
                        email: customerEmail,
                        email_type: "trial_expiring",
                        scheduled_for: trialExpiringDate.toISOString(),
                        metadata: { 
                          stripe_session_id: session.id,
                          customer_name: customer.name || session.customer_details?.name 
                        }
                      });
                    
                    if (trialScheduleError) {
                      logStep("WARNING: Failed to schedule trial expiring email", { error: trialScheduleError.message });
                    } else {
                      logStep("Trial expiring email scheduled for 48h", { email: customerEmail, scheduledFor: trialExpiringDate.toISOString() });
                    }
                  } catch (scheduleErr) {
                    logStep("WARNING: Failed to schedule emails", { 
                      error: scheduleErr instanceof Error ? scheduleErr.message : String(scheduleErr) 
                    });
                  }
                } else {
                  const errorText = await welcomeEmailResponse.text();
                  logStep("WARNING: Failed to send welcome email", { error: errorText });
                }
              } catch (emailError) {
                logStep("WARNING: Failed to send welcome email", { 
                  error: emailError instanceof Error ? emailError.message : String(emailError) 
                });
                // Não quebrar o fluxo principal se o email falhar
              }
            }
          } else {
            logStep("User already exists", { userId: user.id, email: customerEmail });
            
            // Check if user already has password set (not needs_password_setup)
            const needsPasswordSetup = user.user_metadata?.needs_password_setup === true;
            
            // Update user metadata with customer_id
            await supabaseClient.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                stripe_customer_id: session.customer as string
              }
            });

            // Only create setup token if user still needs password setup
            if (needsPasswordSetup) {
              logStep("Existing user needs password setup, creating token");
              const { error: tokenError } = await supabaseClient
                .from("password_setup_tokens")
                .insert({
                  user_id: user.id,
                  email: customerEmail,
                  stripe_session_id: session.id,
                });

              if (tokenError) {
                logStep("ERROR: Failed to create setup token for existing user", { error: tokenError.message });
              }
            } else {
              logStep("Existing user already has password, skipping token creation");
            }
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
        logStep("Invoice payment succeeded", { 
          invoiceId: invoice.id, 
          subscriptionId: invoice.subscription,
          billingReason: invoice.billing_reason 
        });
        
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

          // Verificar se é a primeira cobrança após o trial (trial acabou e agora está ativo)
          // billing_reason = 'subscription_cycle' indica cobrança recorrente (não trial)
          if (invoice.billing_reason === 'subscription_cycle' && 
              subscription.trial_end && 
              subscription.status === 'active') {
            
            logStep("First payment after trial detected, sending activation email");
            
            try {
              const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
              
              if (customer.email) {
                const activationEmailResponse = await fetch(
                  `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-subscription-activated-email`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                    },
                    body: JSON.stringify({ email: customer.email }),
                  }
                );
                
                if (activationEmailResponse.ok) {
                  logStep("Subscription activated email sent successfully", { email: customer.email });
                } else {
                  const errorText = await activationEmailResponse.text();
                  logStep("WARNING: Failed to send subscription activated email", { error: errorText });
                }
              } else {
                logStep("WARNING: No customer email found for activation email");
              }
            } catch (emailError) {
              logStep("WARNING: Failed to send subscription activated email", { 
                error: emailError instanceof Error ? emailError.message : String(emailError) 
              });
            }
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