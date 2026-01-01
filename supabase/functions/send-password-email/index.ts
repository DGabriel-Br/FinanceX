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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">FinanceX</span>
              </div>
              
              <!-- Título -->
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;">
                Definir sua senha
              </h1>
              
              <!-- Texto -->
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #64748b; text-align: center;">
                Clique no botão abaixo para criar sua senha e acessar o FinanceX.
              </p>
              
              <!-- Botão -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${resetLink}" 
                   style="display: inline-block; padding: 12px 32px; font-size: 15px; font-weight: 600; color: #ffffff; background-color: #0f172a; text-decoration: none; border-radius: 6px;">
                  Criar senha
                </a>
              </div>
              
              <!-- Link alternativo -->
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; text-align: center;">
                Ou copie e cole este link:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; color: #64748b; text-align: center; word-break: break-all;">
                ${resetLink}
              </p>
              
              <!-- Aviso -->
              <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                Se você não solicitou este email, pode ignorá-lo.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} FinanceX
        </p>
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
        from: "FinanceX <onboarding@resend.dev>",
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
