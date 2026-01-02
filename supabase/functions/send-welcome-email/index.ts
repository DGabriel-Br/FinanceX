import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

// Generate tracking pixel URL
const getTrackingPixel = (trackingId: string, emailType: string, email: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "";
  const encodedEmail = encodeURIComponent(email);
  return `<img src="${baseUrl}/functions/v1/track-email-open?id=${trackingId}&type=${emailType}&email=${encodedEmail}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
};

interface WelcomeEmailRequest {
  email: string;
  sessionId: string;
  userName?: string;
  trackingId?: string;
}

const getWelcomeEmailHtml = (setupLink: string, trackingPixel: string) => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao FinanceX</title>
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
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Finance<span style="background: linear-gradient(135deg, #22D3EE, #2DD4BF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">X</span>
              </h1>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #1e293b; border-radius: 16px; padding: 40px 32px; border: 1px solid rgba(34, 211, 238, 0.1);">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #ffffff; line-height: 1.6;">
                Fala! 👋
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
                Deu tudo certo com seu cadastro no FinanceX.
              </p>

              <!-- Trial Highlight Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(45, 212, 191, 0.1)); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: #22D3EE; font-weight: 600;">
                      Seu teste grátis de 3 dias já começou agora.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                      A partir de hoje, a ideia é simples:<br>
                      <strong style="color: #ffffff;">antes de gastar, saber quanto sobra.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Next Step Section -->
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                Próximo passo (rápido):
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                É só definir sua senha pra acessar o painel 👇
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${setupLink}" target="_blank" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #22D3EE, #2DD4BF); color: #0f172a; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 20px rgba(34, 211, 238, 0.3);">
                      👉 Criar minha senha e entrar no FinanceX
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Benefits Section -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: rgba(255, 255, 255, 0.7);">
                Assim que entrar, você já vai ver:
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #4ADE80; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">quanto sobra neste mês</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #4ADE80; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">como esse número muda a cada gasto</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #4ADE80; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">e decidir com mais clareza antes de gastar</span>
                  </td>
                </tr>
              </table>

              <!-- About Trial Section -->
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff; font-weight: 600;">
                Sobre o teste (sem pegadinha):
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="font-size: 15px; margin-right: 8px;">🆓</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Você pode usar tudo por 3 dias</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="font-size: 15px; margin-right: 8px;">💳</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Depois disso, o plano custa R$14,90/mês</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="font-size: 15px; margin-right: 8px;">❌</span>
                    <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Dá pra cancelar quando quiser, em 1 clique</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); line-height: 1.5;">
                A gente te avisa por e-mail antes de qualquer cobrança, relaxa.
              </p>

              <!-- Closing -->
              <p style="margin: 0 0 8px 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                Qualquer dúvida, é só responder esse e-mail.
              </p>
              
              <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.7); line-height: 1.5;">
                Agora vai lá, leva menos de 1 minuto pra começar.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #ffffff; font-weight: 500;">
                — FinanceX
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                Menos ansiedade. Mais clareza.
              </p>
              <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.4); font-style: italic;">
                PS: quanto mais você lança, mais claro fica.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>
`;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Welcome email request received");

    const { email, sessionId, userName, trackingId }: WelcomeEmailRequest = await req.json();

    if (!email || !sessionId) {
      logStep("ERROR: Missing required fields", { email: !!email, sessionId: !!sessionId });
      return new Response(
        JSON.stringify({ error: "Email and sessionId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing welcome email", { email, sessionId, userName });

    // Generate tracking ID if not provided
    const emailTrackingId = trackingId || crypto.randomUUID();
    const trackingPixel = getTrackingPixel(emailTrackingId, "welcome", email);

    // Construir o link de setup de senha
    const baseUrl = "https://financex.lovable.app";
    const setupLink = `${baseUrl}/setup-password?session_id=${sessionId}`;

    logStep("Setup link generated", { setupLink, trackingId: emailTrackingId });

    const emailHtml = getWelcomeEmailHtml(setupLink, trackingPixel);

    const emailResponse = await resend.emails.send({
      from: "FinanceX <contato@financex.com.br>",
      to: [email],
      subject: "Tá tudo certo. Seu teste no FinanceX já começou ✨",
      html: emailHtml,
    });

    logStep("Email sent successfully", { emailResponse, to: email, trackingId: emailTrackingId });

    return new Response(
      JSON.stringify({ success: true, emailResponse, trackingId: emailTrackingId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR sending welcome email", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
