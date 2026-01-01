import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESEND-SETUP-TOKEN] ${step}${detailsStr}`);
};

// Rate limit check: 1 per minute, 5 per hour
async function checkRateLimit(supabase: SupabaseClient, email: string): Promise<{ allowed: boolean; message?: string }> {
  const action = 'resend_setup_token';
  
  // Check last minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { data: recentEmails, error: recentError } = await supabase
    .from('email_rate_limits')
    .select('id')
    .eq('email', email)
    .eq('action', action)
    .gte('created_at', oneMinuteAgo);
    
  if (recentError) {
    logStep("Rate limit check error", { error: recentError.message });
    return { allowed: true };
  }
  
  if (recentEmails && recentEmails.length >= 1) {
    logStep("Rate limited - too many requests in last minute", { email, count: recentEmails.length });
    return { allowed: false, message: "Aguarde 1 minuto antes de solicitar outro email." };
  }
  
  // Check last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: hourlyEmails, error: hourlyError } = await supabase
    .from('email_rate_limits')
    .select('id')
    .eq('email', email)
    .eq('action', action)
    .gte('created_at', oneHourAgo);
    
  if (hourlyError) {
    logStep("Hourly rate limit check error", { error: hourlyError.message });
    return { allowed: true };
  }
  
  if (hourlyEmails && hourlyEmails.length >= 5) {
    logStep("Rate limited - too many requests in last hour", { email, count: hourlyEmails.length });
    return { allowed: false, message: "Limite de 5 emails por hora atingido. Tente novamente mais tarde." };
  }
  
  return { allowed: true };
}

async function recordEmailSent(supabase: SupabaseClient, email: string): Promise<void> {
  const { error } = await supabase
    .from('email_rate_limits')
    .insert({ email, action: 'resend_setup_token' });
    
  if (error) {
    logStep("Failed to record rate limit", { error: error.message });
  }
  
  // Cleanup old records occasionally (1% of requests)
  if (Math.random() < 0.01) {
    await supabase.rpc('cleanup_old_rate_limits');
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const { email } = await req.json();
    if (!email) {
      throw new Error("E-mail é obrigatório");
    }
    logStep("Received email", { email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit FIRST
    const rateLimitResult = await checkRateLimit(supabase, email);
    if (!rateLimitResult.allowed) {
      logStep("Request rate limited", { email });
      return new Response(
        JSON.stringify({ error: rateLimitResult.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      logStep("ERROR: Failed to list users", { error: userError.message });
      throw new Error("Erro ao buscar usuário");
    }

    const user = userData.users.find((u: { email?: string }) => u.email === email);
    if (!user) {
      logStep("User not found", { email });
      throw new Error("Usuário não encontrado. Verifique se você completou o checkout.");
    }

    // Check if user needs password setup
    if (!user.user_metadata?.needs_password_setup) {
      logStep("User already has password set", { email });
      throw new Error("Você já possui uma senha definida. Faça login para continuar.");
    }

    logStep("User found, needs password setup", { userId: user.id });

    // Invalidate previous tokens for this email
    const { error: invalidateError } = await supabase
      .from("password_setup_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email)
      .is("used_at", null);

    if (invalidateError) {
      logStep("Warning: Failed to invalidate old tokens", { error: invalidateError.message });
    }

    // Create new token with 24h expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: tokenData, error: tokenError } = await supabase
      .from("password_setup_tokens")
      .insert({
        user_id: user.id,
        email: email,
        expires_at: expiresAt.toISOString(),
      })
      .select("token")
      .single();

    if (tokenError || !tokenData) {
      logStep("ERROR: Failed to create token", { error: tokenError?.message });
      throw new Error("Erro ao gerar novo link");
    }

    logStep("New token created", { tokenId: tokenData.token });

    // Record email for rate limiting
    await recordEmailSent(supabase, email);

    // Send email with new link
    const appUrl = "https://financex.lovable.app";
    const directSetupUrl = `${appUrl}/setup-password?token=${tokenData.token}`;

    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "FinanceX <noreply@financex.app>",
            to: [email],
            subject: "Novo link de acesso - FinanceX",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0ea5e9; margin: 0;">FinanceX</h1>
                </div>
                
                <h2 style="color: #1a1a1a;">Seu novo link de acesso</h2>
                
                <p>Olá!</p>
                
                <p>Você solicitou um novo link para configurar sua senha no FinanceX.</p>
                
                <p>Clique no botão abaixo para definir sua senha:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${directSetupUrl}" style="background-color: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Definir minha senha
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Este link expira em 24 horas. Se você não solicitou este link, pode ignorar este e-mail.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                  FinanceX - Controle financeiro simples e objetivo
                </p>
              </body>
              </html>
            `,
          }),
        });

        if (emailResponse.ok) {
          logStep("Email sent successfully");
        } else {
          const errorData = await emailResponse.text();
          logStep("Warning: Email sending failed", { error: errorData });
        }
      } catch (emailErr) {
        logStep("Warning: Email sending error", { error: String(emailErr) });
      }
    } else {
      logStep("RESEND_API_KEY not configured, skipping email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Novo link enviado para seu e-mail." 
      }),
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
