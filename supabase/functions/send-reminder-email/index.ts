import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-REMINDER-EMAIL] ${step}${detailsStr}`);
};

// Generate tracking pixel URL
const getTrackingPixel = (trackingId: string, emailType: string, email: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  const encodedEmail = encodeURIComponent(email);
  return `<img src="${baseUrl}/functions/v1/track-email-open?id=${trackingId}&type=${emailType}&email=${encodedEmail}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
};

interface ReminderEmailRequest {
  email: string;
  trackingId?: string;
}

function getEmailBaseStyles(): string {
  return `
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #1a2332 100%);
      border-radius: 16px;
      border: 1px solid rgba(34, 211, 238, 0.15);
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .logo-x {
      background: linear-gradient(135deg, #22D3EE, #2DD4BF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content {
      color: rgba(255, 255, 255, 0.85);
      font-size: 16px;
      line-height: 1.7;
    }
    .greeting {
      color: #ffffff;
      font-size: 18px;
      margin-bottom: 24px;
    }
    .highlight {
      color: #22D3EE;
      font-weight: 600;
    }
    .highlight-box {
      background: rgba(34, 211, 238, 0.08);
      border-left: 3px solid #22D3EE;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight-box p {
      margin: 0;
      color: #ffffff;
      font-size: 17px;
    }
    .motivational {
      font-style: italic;
      color: rgba(255, 255, 255, 0.7);
      margin: 28px 0;
      padding-left: 16px;
      border-left: 2px solid rgba(34, 211, 238, 0.3);
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
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 10px 30px -10px rgba(34, 211, 238, 0.4);
      transition: all 0.2s ease;
    }
    .footer-text {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin-top: 28px;
    }
    .signature {
      color: #ffffff;
      font-weight: 600;
      margin-top: 24px;
    }
  `;
}

function getReminderEmailHtml(trackingPixel: string): string {
  const dashboardLink = "https://financex.lovable.app/dashboard";
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Você já sabe quanto sobra este mês?</title>
  <style>${getEmailBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <!-- Logo -->
      <div class="logo">
        <span class="logo-text">Finance<span class="logo-x">X</span></span>
      </div>
      
      <!-- Content -->
      <div class="content">
        <p class="greeting">Oi,</p>
        
        <p>Passando rápido pra te lembrar do ponto central do FinanceX:</p>
        
        <div class="highlight-box">
          <p>👉 <span class="highlight">quanto sobra este mês, no ritmo atual.</span></p>
        </div>
        
        <p>Se você já lançou alguns gastos, esse número já está trabalhando por você.</p>
        <p>Se ainda não lançou, vale 30 segundos pra testar — só um gasto já muda tudo.</p>
        
        <p class="motivational">A clareza vem do uso, não da perfeição.</p>
        
        <!-- CTA Button -->
        <div class="cta-container">
          <a href="${dashboardLink}" class="cta-button">Entrar no FinanceX</a>
        </div>
        
        <p class="footer-text">Qualquer dúvida, é só responder este e-mail.</p>
        
        <p class="signature">— FinanceX</p>
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing reminder email request");
    
    const { email, trackingId }: ReminderEmailRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    // Generate tracking ID if not provided
    const emailTrackingId = trackingId || crypto.randomUUID();
    const trackingPixel = getTrackingPixel(emailTrackingId, "reminder_24h", email);
    
    logStep("Sending reminder email", { email, trackingId: emailTrackingId });
    
    const emailResponse = await resend.emails.send({
      from: "FinanceX <appfinancex@resend.dev>",
      to: [email],
      subject: "Você já sabe quanto sobra este mês?",
      html: getReminderEmailHtml(trackingPixel),
    });
    
    logStep("Reminder email sent successfully", { emailResponse, trackingId: emailTrackingId });
    
    return new Response(JSON.stringify({ success: true, emailResponse, trackingId: emailTrackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR sending reminder email", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
