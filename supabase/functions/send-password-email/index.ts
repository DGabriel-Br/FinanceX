import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordEmailRequest {
  email: string;
  resetLink: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PASSWORD-EMAIL] ${step}${detailsStr}`);
};

// Rate limit check: 1 per minute, 5 per hour
async function checkRateLimit(supabase: SupabaseClient, email: string): Promise<{ allowed: boolean; message?: string }> {
  const action = 'send_password_email';
  
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
    // Allow on error to not block legitimate requests
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
    .insert({ email, action: 'send_password_email' });
    
  if (error) {
    logStep("Failed to record rate limit", { error: error.message });
  }
  
  // Cleanup old records occasionally (1% of requests)
  if (Math.random() < 0.01) {
    await supabase.rpc('cleanup_old_rate_limits');
  }
}

const handler = async (req: Request): Promise<Response> => {
  logStep("Function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, resetLink }: PasswordEmailRequest = await req.json();
    
    logStep("Received request", { email });

    if (!email || !resetLink) {
      logStep("Missing required fields", { email: !!email, resetLink: !!resetLink });
      return new Response(
        JSON.stringify({ error: "Email e link são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(supabase, email);
    if (!rateLimitResult.allowed) {
      logStep("Request rate limited", { email });
      return new Response(
        JSON.stringify({ error: rateLimitResult.message }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Defina sua senha - FinanceX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="https://financex.lovable.app/images/financex-logo.png" alt="FinanceX" width="160" height="40" style="display: block; width: 160px; height: auto;" />
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #1e293b; border-radius: 16px; padding: 40px 32px; border: 1px solid rgba(34, 211, 238, 0.1);">
              
              <!-- Title -->
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #ffffff; text-align: center;">
                Definir sua senha
              </h1>
              
              <!-- Text -->
              <p style="margin: 0 0 32px 0; font-size: 16px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; text-align: center;">
                Clique no botão abaixo para criar sua senha e acessar o FinanceX.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #22D3EE, #2DD4BF); color: #0f172a; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(34, 211, 238, 0.3);">
                      Criar senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative link -->
              <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                Ou copie e cole este link:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; color: rgba(255, 255, 255, 0.6); text-align: center; word-break: break-all;">
                ${resetLink}
              </p>
              
              <!-- Warning -->
              <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); text-align: center;">
                Se você não solicitou este email, pode ignorá-lo.
              </p>
              
              <!-- Signature -->
              <p style="margin: 0; font-size: 15px; color: #ffffff; font-weight: 500; text-align: center;">
                — FinanceX
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.4);">
                © ${new Date().getFullYear()} FinanceX. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FinanceX <appfinancex@resend.dev>",
        to: [email],
        subject: "Defina sua senha - FinanceX",
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      logStep("Resend API error", { error: data });
      return new Response(
        JSON.stringify({ error: data.message || "Erro ao enviar email" }),
        { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Record successful email for rate limiting
    await recordEmailSent(supabase, email);

    logStep("Email sent successfully", { id: data.id });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
