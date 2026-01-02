import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[SEND-TEST-EMAILS] ${step}`, details ? JSON.stringify(details) : '');
};

interface TestEmailRequest {
  email: string;
}

const invokeEmailFunction = async (functionName: string, payload: Record<string, unknown>) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  
  const result = await response.json();
  return { success: response.ok, result };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json() as TestEmailRequest;

    if (!email) {
      throw new Error('Email is required');
    }

    logStep('Starting test emails send', { email });

    const results: Record<string, { success: boolean; result: unknown }> = {};

    // 1. Welcome Email
    logStep('Sending Welcome Email');
    results['welcome'] = await invokeEmailFunction('send-welcome-email', {
      email,
      sessionId: 'test-session-id-for-preview',
      userName: 'Usuário Teste',
      trackingId: crypto.randomUUID(),
    });

    // 2. Reminder Email
    logStep('Sending Reminder Email');
    results['reminder'] = await invokeEmailFunction('send-reminder-email', {
      email,
      trackingId: crypto.randomUUID(),
    });

    // 3. Trial Expiring Email
    logStep('Sending Trial Expiring Email');
    results['trial_expiring'] = await invokeEmailFunction('send-trial-expiring-email', {
      email,
      trackingId: crypto.randomUUID(),
    });

    // 4. Subscription Activated Email
    logStep('Sending Subscription Activated Email');
    results['subscription_activated'] = await invokeEmailFunction('send-subscription-activated-email', {
      email,
      trackingId: crypto.randomUUID(),
    });

    // 5. Trial Cancelled Email
    logStep('Sending Trial Cancelled Email');
    results['trial_cancelled'] = await invokeEmailFunction('send-trial-cancelled-email', {
      email,
      trackingId: crypto.randomUUID(),
    });

    logStep('All emails sent', { results });

    const successCount = Object.values(results).filter(r => r.success).length;

    return new Response(JSON.stringify({
      success: true,
      message: `${successCount}/5 emails enviados com sucesso para ${email}`,
      details: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep('Error sending test emails', { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
