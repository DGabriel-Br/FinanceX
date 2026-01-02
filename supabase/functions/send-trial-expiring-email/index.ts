import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-TRIAL-EXPIRING-EMAIL] ${step}${detailsStr}`);
};

// Generate tracking pixel URL
const getTrackingPixel = (trackingId: string, emailType: string, email: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  const encodedEmail = encodeURIComponent(email);
  return `<img src="${baseUrl}/functions/v1/track-email-open?id=${trackingId}&type=${emailType}&email=${encodedEmail}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
};

const getEmailBaseStyles = () => `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #0f172a;
    color: #e2e8f0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(34, 211, 238, 0.2);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }
  .logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo-text {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #22D3EE, #2DD4BF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  h1 {
    color: #f1f5f9;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    line-height: 1.4;
  }
  p {
    color: #94a3b8;
    font-size: 16px;
    line-height: 1.7;
    margin: 0 0 20px 0;
  }
  .highlight {
    color: #22d3ee;
  }
  .info-list {
    margin: 24px 0;
    padding: 0;
    list-style: none;
  }
  .info-item {
    color: #cbd5e1;
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .info-icon {
    flex-shrink: 0;
    font-size: 18px;
  }
  .bold {
    font-weight: 600;
    color: #f1f5f9;
  }
  .cta-container {
    text-align: center;
    margin: 32px 0;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #22D3EE 0%, #2DD4BF 100%);
    color: #0f172a !important;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 4px 16px rgba(34, 211, 238, 0.3);
    transition: all 0.2s ease;
  }
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34, 211, 238, 0.4);
  }
  .transparency {
    color: #64748b;
    font-size: 14px;
    text-align: center;
    margin-top: 24px;
    font-style: italic;
  }
  .signature {
    color: #64748b;
    font-size: 14px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
  }
`;

const getTrialExpiringEmailHtml = (trackingPixel: string) => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu teste termina amanhã</title>
  <style>${getEmailBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">Finance<span style="color: #2DD4BF;">X</span></span>
      </div>
      
      <p style="color: #f1f5f9; font-size: 18px;">Oi,</p>
      
      <p style="color: #f1f5f9;">Seu período de teste gratuito do <span class="highlight">FinanceX</span> termina amanhã.</p>
      
      <p>A partir disso, acontece o que combinamos desde o início:</p>
      
      <div class="info-list">
        <div class="info-item">
          <span class="info-icon">💳</span>
          <span>cobrança automática de <span class="bold">R$14,90/mês</span></span>
        </div>
        <div class="info-item">
          <span class="info-icon">❌</span>
          <span>cancelamento disponível a qualquer momento, em 1 clique</span>
        </div>
      </div>
      
      <p>Se o FinanceX já te ajudou a decidir melhor antes de gastar, ótimo.<br>
      Se ainda não fez sentido, tudo bem também, é só cancelar.</p>
      
      <div class="cta-container">
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 16px;">👉 Gerenciar minha conta</p>
        <a href="https://financex.lovable.app/dashboard" class="cta-button">Entrar no FinanceX</a>
      </div>
      
      <p class="transparency">Sem letras miúdas. Sem pegadinhas.</p>
      
      <div class="signature">
        — FinanceX
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
  `;
};

interface TrialExpiringEmailRequest {
  email: string;
  trackingId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, trackingId }: TrialExpiringEmailRequest = await req.json();
    
    // Generate tracking ID if not provided
    const emailTrackingId = trackingId || crypto.randomUUID();
    const trackingPixel = getTrackingPixel(emailTrackingId, "trial_expiring", email);
    
    logStep("Sending trial expiring email", { email, trackingId: emailTrackingId });

    const emailResponse = await resend.emails.send({
      from: "FinanceX <appfinancex@resend.dev>",
      to: [email],
      subject: "Seu teste termina amanhã",
      html: getTrialExpiringEmailHtml(trackingPixel),
    });

    logStep("Trial expiring email sent successfully", { email, response: emailResponse, trackingId: emailTrackingId });

    return new Response(JSON.stringify({ success: true, data: emailResponse, trackingId: emailTrackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR sending trial expiring email", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
