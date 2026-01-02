import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// 1x1 transparent GIF in base64
const TRANSPARENT_GIF_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRACK-EMAIL-OPEN] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("id");
    const emailType = url.searchParams.get("type") || "unknown";
    const recipientEmail = url.searchParams.get("email") || "";

    logStep("Tracking pixel requested", { trackingId, emailType, recipientEmail: recipientEmail ? "***" : "none" });

    if (trackingId) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Get user agent and IP for analytics
      const userAgent = req.headers.get("user-agent") || null;
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

      // Insert tracking event
      const { error } = await supabaseClient
        .from("email_tracking")
        .insert({
          email_id: trackingId,
          email_type: emailType,
          recipient_email: recipientEmail,
          user_agent: userAgent,
          ip_address: ipAddress,
        });

      if (error) {
        logStep("ERROR: Failed to insert tracking event", { error: error.message });
      } else {
        logStep("Tracking event recorded", { trackingId, emailType });
      }
    }

    // Return 1x1 transparent GIF
    const gifBuffer = Uint8Array.from(atob(TRANSPARENT_GIF_BASE64), c => c.charCodeAt(0));
    
    return new Response(gifBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in tracking", { message: errorMessage });
    
    // Still return the GIF even if tracking fails
    const gifBuffer = Uint8Array.from(atob(TRANSPARENT_GIF_BASE64), c => c.charCodeAt(0));
    return new Response(gifBuffer, {
      status: 200,
      headers: { "Content-Type": "image/gif" },
    });
  }
});
