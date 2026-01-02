import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PROCESS-SCHEDULED-EMAILS] ${step}${detailsStr}`);
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting scheduled emails processing");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch pending emails that are due
    const now = new Date().toISOString();
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from("scheduled_emails")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(50);
    
    if (fetchError) {
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
    }
    
    logStep("Found pending emails", { count: pendingEmails?.length || 0 });
    
    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending emails" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const scheduledEmail of pendingEmails) {
      try {
        logStep("Processing email", { 
          id: scheduledEmail.id, 
          type: scheduledEmail.email_type,
          email: scheduledEmail.email 
        });
        
        // Determine which function to call based on email type
        let functionName: string;
        let payload: Record<string, unknown>;
        
        switch (scheduledEmail.email_type) {
          case "reminder_24h":
            functionName = "send-reminder-email";
            payload = { email: scheduledEmail.email };
            break;
          default:
            throw new Error(`Unknown email type: ${scheduledEmail.email_type}`);
        }
        
        // Invoke the appropriate email function
        const { error: invokeError } = await supabaseAdmin.functions.invoke(functionName, {
          body: payload,
        });
        
        if (invokeError) {
          throw new Error(`Failed to invoke ${functionName}: ${invokeError.message}`);
        }
        
        // Update status to sent
        const { error: updateError } = await supabaseAdmin
          .from("scheduled_emails")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString() 
          })
          .eq("id", scheduledEmail.id);
        
        if (updateError) {
          logStep("WARNING: Failed to update email status", { 
            id: scheduledEmail.id, 
            error: updateError.message 
          });
        }
        
        successCount++;
        logStep("Email sent successfully", { id: scheduledEmail.id });
        
      } catch (emailError: unknown) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        errorCount++;
        
        logStep("ERROR processing email", { 
          id: scheduledEmail.id, 
          error: errorMessage 
        });
        
        // Update status to failed
        await supabaseAdmin
          .from("scheduled_emails")
          .update({ 
            status: "failed", 
            error_message: errorMessage 
          })
          .eq("id", scheduledEmail.id);
      }
    }
    
    logStep("Processing complete", { successCount, errorCount });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingEmails.length,
        sent: successCount,
        failed: errorCount
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-scheduled-emails", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
