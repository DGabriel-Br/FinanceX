import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FunnelStep {
  event_name: string;
  count: number;
  label: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[admin-funnel-stats] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('[admin-funnel-stats] Invalid user token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-funnel-stats] User authenticated:', user.id);

    // Use service role to check admin status (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('[admin-funnel-stats] Error checking role:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.warn('[admin-funnel-stats] User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-funnel-stats] Admin verified, fetching stats');

    // Parse query params for date range
    const url = new URL(req.url);
    const daysBack = parseInt(url.searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Funnel events in order
    const funnelEvents = [
      { event_name: 'password_setup_completed', label: '1. Definiu senha' },
      { event_name: 'onboarding_started', label: '2. Iniciou onboarding' },
      { event_name: 'onboarding_income_added', label: '3. Inseriu renda' },
      { event_name: 'onboarding_expense_added', label: '4. Inseriu 1º gasto' },
      { event_name: 'onboarding_completed', label: '5. Viu "quanto sobra"' },
    ];

    // Query counts for each event
    const funnelStats: FunnelStep[] = [];

    for (const event of funnelEvents) {
      const { count, error } = await supabaseAdmin
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', event.event_name)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error(`[admin-funnel-stats] Error querying ${event.event_name}:`, error.message);
        funnelStats.push({ ...event, count: 0 });
      } else {
        funnelStats.push({ ...event, count: count || 0 });
      }
    }

    // Get additional metrics
    const { count: totalSignups } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'signup_completed')
      .gte('created_at', startDate.toISOString());

    const { count: checkoutStarted } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'checkout_started')
      .gte('created_at', startDate.toISOString());

    const { count: checkoutCompleted } = await supabaseAdmin
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'checkout_completed')
      .gte('created_at', startDate.toISOString());

    // Get daily breakdown for the main funnel
    const { data: dailyData, error: dailyError } = await supabaseAdmin
      .from('analytics_events')
      .select('event_name, created_at')
      .in('event_name', funnelEvents.map(e => e.event_name))
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const dailyBreakdown: Record<string, Record<string, number>> = {};
    if (dailyData && !dailyError) {
      for (const row of dailyData) {
        const day = row.created_at.split('T')[0];
        if (!dailyBreakdown[day]) {
          dailyBreakdown[day] = {};
        }
        dailyBreakdown[day][row.event_name] = (dailyBreakdown[day][row.event_name] || 0) + 1;
      }
    }

    // Get income range distribution
    const { data: incomeData } = await supabaseAdmin
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'onboarding_income_added')
      .gte('created_at', startDate.toISOString());

    const incomeRanges: Record<string, number> = {};
    if (incomeData) {
      for (const row of incomeData) {
        const range = (row.properties as Record<string, unknown>)?.income_range as string || 'unknown';
        incomeRanges[range] = (incomeRanges[range] || 0) + 1;
      }
    }

    // Get expense categories distribution
    const { data: expenseData } = await supabaseAdmin
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'onboarding_expense_added')
      .gte('created_at', startDate.toISOString());

    const expenseCategories: Record<string, number> = {};
    if (expenseData) {
      for (const row of expenseData) {
        const category = (row.properties as Record<string, unknown>)?.category as string || 'unknown';
        expenseCategories[category] = (expenseCategories[category] || 0) + 1;
      }
    }

    // Get projection outcomes
    const { data: completedData } = await supabaseAdmin
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'onboarding_completed')
      .gte('created_at', startDate.toISOString());

    let positiveOutcomes = 0;
    let negativeOutcomes = 0;
    if (completedData) {
      for (const row of completedData) {
        const isPositive = (row.properties as Record<string, unknown>)?.is_positive;
        if (isPositive) positiveOutcomes++;
        else negativeOutcomes++;
      }
    }

    console.log('[admin-funnel-stats] Stats fetched successfully');

    return new Response(
      JSON.stringify({
        funnel: funnelStats,
        metrics: {
          totalSignups: totalSignups || 0,
          checkoutStarted: checkoutStarted || 0,
          checkoutCompleted: checkoutCompleted || 0,
        },
        dailyBreakdown,
        incomeRanges,
        expenseCategories,
        projectionOutcomes: {
          positive: positiveOutcomes,
          negative: negativeOutcomes,
        },
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days: daysBack,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[admin-funnel-stats] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});