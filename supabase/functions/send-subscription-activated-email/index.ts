import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUBSCRIPTION-ACTIVATED-EMAIL] ${step}${detailsStr}`);
};

// Generate tracking pixel URL
const getTrackingPixel = (trackingId: string, emailType: string, email: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  const encodedEmail = encodeURIComponent(email);
  return `<img src="${baseUrl}/functions/v1/track-email-open?id=${trackingId}&type=${emailType}&email=${encodedEmail}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
};

// Estilos base do email (mesmo padrão dos outros emails)
const getEmailBaseStyles = () => `
  body {
    margin: 0;
    padding: 0;
    background-color: #0f172a;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: linear-gradient(135deg, #1e293b 0%, #1a2332 100%);
    border: 1px solid rgba(34, 211, 238, 0.15);
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
    letter-spacing: -0.5px;
  }
  .logo-finance {
    color: #f1f5f9;
  }
  .logo-x {
    background: linear-gradient(135deg, #22D3EE 0%, #2DD4BF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .content {
    color: #cbd5e1;
    font-size: 16px;
    line-height: 1.7;
  }
  .greeting {
    color: #f1f5f9;
    font-size: 16px;
    margin-bottom: 20px;
  }
  .highlight {
    color: #f1f5f9;
    font-weight: 600;
  }
  .focus-intro {
    color: #94a3b8;
    font-size: 15px;
    margin-top: 24px;
    margin-bottom: 16px;
  }
  .bullet-list {
    margin: 0 0 24px 0;
    padding-left: 8px;
    list-style: none;
  }
  .bullet-list li {
    color: #cbd5e1;
    font-size: 15px;
    line-height: 1.8;
    padding-left: 0;
  }
  .bullet-list li::before {
    content: "• ";
    color: #22D3EE;
  }
  .message-box {
    background: rgba(15, 23, 42, 0.5);
    border-left: 3px solid #22D3EE;
    padding: 16px 20px;
    margin: 24px 0;
    border-radius: 0 8px 8px 0;
  }
  .message-box p {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
  .message-box .bold {
    color: #f1f5f9;
    font-weight: 600;
  }
  .cta-section {
    margin-top: 28px;
    margin-bottom: 24px;
  }
  .cta-intro {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .cta-pointer {
    color: #cbd5e1;
    font-size: 15px;
    margin-bottom: 16px;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #22D3EE 0%, #2DD4BF 100%);
    color: #0f172a !important;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .cta-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(34, 211, 238, 0.3);
  }
  .support-text {
    color: #64748b;
    font-size: 14px;
    margin-top: 24px;
  }
  .signature {
    color: #94a3b8;
    font-size: 15px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }
`;

interface SubscriptionActivatedEmailRequest {
  email: string;
  trackingId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { email, trackingId }: SubscriptionActivatedEmailRequest = await req.json();
    logStep("Request parsed", { email });

    if (!email) {
      throw new Error("Email is required");
    }

    // Generate tracking ID if not provided
    const emailTrackingId = trackingId || crypto.randomUUID();
    const trackingPixel = getTrackingPixel(emailTrackingId, "subscription_activated", email);

    const dashboardUrl = "https://financex.lovable.app/dashboard";

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu FinanceX está ativo</title>
  <style>${getEmailBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <img src="https://financex.app.br/images/financex-logo.png" alt="FinanceX" width="160" height="40" style="display: block; margin: 0 auto; width: 160px; height: auto;" />
      </div>
      
      <div class="content">
        <p class="greeting">Oi,</p>
        
        <p class="highlight">Seu plano do FinanceX está ativo.</p>
        
        <p class="focus-intro">A partir de agora, o foco é simples:</p>
        
        <ul class="bullet-list">
          <li>lançar gastos</li>
          <li>consultar quanto sobra</li>
          <li>decidir com mais calma</li>
        </ul>
        
        <div class="message-box">
          <p>Não é sobre controlar tudo.<br>É sobre <span class="bold">não ser pego de surpresa</span> no fim do mês.</p>
        </div>
        
        <div class="cta-section">
          <p class="cta-intro">Se quiser, comece por aqui:</p>
          <p class="cta-pointer">👉 Lançar um gasto agora</p>
          <a href="${dashboardUrl}" class="cta-button">Entrar no FinanceX</a>
        </div>
        
        <p class="support-text">Qualquer dúvida, estamos por perto.</p>
        
        <p class="signature">— FinanceX</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px;">
      <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.4);">
        © ${new Date().getFullYear()} FinanceX. Todos os direitos reservados.
      </p>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
    `;

    logStep("Sending email", { to: email, trackingId: emailTrackingId });

    const emailResponse = await resend.emails.send({
      from: "FinanceX <appfinancex@resend.dev>",
      to: [email],
      subject: "Seu FinanceX está ativo",
      html: emailHtml,
    });

    logStep("Email sent successfully", { response: emailResponse, trackingId: emailTrackingId });

    return new Response(JSON.stringify({ ...emailResponse, trackingId: emailTrackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
