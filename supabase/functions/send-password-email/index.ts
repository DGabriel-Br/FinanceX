import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordEmailRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-password-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: PasswordEmailRequest = await req.json();
    
    console.log("Sending password reset email to:", email);

    if (!email || !resetLink) {
      console.error("Missing required fields:", { email: !!email, resetLink: !!resetLink });
      return new Response(
        JSON.stringify({ error: "Email e link são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Erro ao enviar email" }),
        { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
