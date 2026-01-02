import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TRIAL-CANCELLED-EMAIL] ${step}${detailsStr}`);
};

// Generate tracking pixel URL
const getTrackingPixel = (trackingId: string, emailType: string, email: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  const encodedEmail = encodeURIComponent(email);
  return `<img src="${baseUrl}/functions/v1/track-email-open?id=${trackingId}&type=${emailType}&email=${encodedEmail}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
};

const getEmailBaseStyles = () => `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
    color: #f8fafc;
  }
  .logo-x {
    background: linear-gradient(135deg, #22D3EE 0%, #2DD4BF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .greeting {
    font-size: 18px;
    color: #f8fafc;
    margin-bottom: 24px;
  }
  .main-text {
    font-size: 16px;
    line-height: 1.7;
    color: #cbd5e1;
    margin-bottom: 24px;
  }
  .confirmation-box {
    background: rgba(34, 211, 238, 0.1);
    border-left: 3px solid #22D3EE;
    padding: 16px 20px;
    margin: 24px 0;
    border-radius: 0 8px 8px 0;
  }
  .confirmation-item {
    font-size: 15px;
    color: #e2e8f0;
    margin: 8px 0;
    display: flex;
    align-items: center;
  }
  .confirmation-item span {
    margin-right: 8px;
  }
  .no-tricks {
    font-size: 14px;
    color: #94a3b8;
    margin: 20px 0;
    font-style: italic;
  }
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #f8fafc;
    margin: 32px 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(34, 211, 238, 0.3);
  }
  .reasons-intro {
    font-size: 15px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  .reasons-list {
    margin: 16px 0;
    padding-left: 0;
    list-style: none;
  }
  .reasons-list li {
    font-size: 15px;
    color: #94a3b8;
    margin: 10px 0;
    padding-left: 24px;
    position: relative;
  }
  .reasons-list li::before {
    content: "•";
    color: #22D3EE;
    position: absolute;
    left: 8px;
  }
  .comeback-text {
    font-size: 15px;
    color: #cbd5e1;
    margin: 24px 0;
    line-height: 1.7;
  }
  .thanks-text {
    font-size: 15px;
    color: #e2e8f0;
    margin: 24px 0;
    line-height: 1.7;
  }
  .signature {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    text-align: center;
  }
  .signature-name {
    font-size: 16px;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 4px;
  }
  .signature-tagline {
    font-size: 14px;
    color: #94a3b8;
  }
  .ps-text {
    font-size: 13px;
    color: #64748b;
    font-style: italic;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px dashed rgba(148, 163, 184, 0.2);
  }
`;

interface TrialCancelledEmailRequest {
  email: string;
  trackingId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, trackingId }: TrialCancelledEmailRequest = await req.json();
    
    // Generate tracking ID if not provided
    const emailTrackingId = trackingId || crypto.randomUUID();
    const trackingPixel = getTrackingPixel(emailTrackingId, "trial_cancelled", email);
    
    logStep("Sending trial cancelled email", { email, trackingId: emailTrackingId });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Seu teste no FinanceX foi cancelado</title>
          <style>${getEmailBaseStyles()}</style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <span class="logo-text">
                  <span class="logo-finance">Finance</span><span class="logo-x">X</span>
                </span>
              </div>
              
              <p class="greeting">Fala! 👋</p>
              
              <p class="main-text">
                Passando só pra confirmar que seu <strong>teste no FinanceX foi cancelado com sucesso.</strong>
              </p>
              
              <div class="confirmation-box">
                <div class="confirmation-item">
                  <span>👉</span> Nenhuma cobrança será feita.
                </div>
                <div class="confirmation-item">
                  <span>👉</span> Seu acesso fica ativo até o fim do período de teste.
                </div>
              </div>
              
              <p class="no-tricks">Sem letra miúda. Sem pegadinha.</p>
              
              <div class="section-title">Antes de você ir</div>
              
              <p class="reasons-intro">Se em algum momento você sentir que:</p>
              
              <ul class="reasons-list">
                <li>o dinheiro some e você não sabe pra onde foi</li>
                <li>planilha dá preguiça</li>
                <li>só queria saber quanto sobra antes de gastar</li>
              </ul>
              
              <p class="comeback-text">
                O FinanceX vai continuar aqui.<br><br>
                Quando quiser voltar, é só entrar de novo e reativar.<br>
                Leva menos de 1 minuto.
              </p>
              
              <p class="thanks-text">
                Obrigado por testar, de verdade.<br>
                Mesmo que não seja agora, clareza financeira sempre vale.
              </p>
              
              <div class="signature">
                <div class="signature-name">— FinanceX</div>
                <div class="signature-tagline">Menos ansiedade. Mais clareza.</div>
              </div>
              
              <p class="ps-text">
                PS: se quiser responder esse e-mail dizendo o motivo do cancelamento, ajuda muito a gente a melhorar.
              </p>
            </div>
          </div>
          ${trackingPixel}
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "FinanceX <appfinancex@resend.dev>",
      to: [email],
      subject: "Tudo certo. Seu teste no FinanceX foi cancelado",
      html: emailHtml,
    });

    logStep("Trial cancelled email sent successfully", { email, response: emailResponse, trackingId: emailTrackingId });

    return new Response(JSON.stringify({ ...emailResponse, trackingId: emailTrackingId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR sending trial cancelled email", { error: error.message });
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
