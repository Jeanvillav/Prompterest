import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkPolicies() {
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('get_rls_status');
    // If RPC doesn't exist, we can query pg_policies
    console.log('--- POLÍTICAS ACTUALES EN PROMPTS ---');
    const { data, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'prompts');

    // In Supabase, you can't usually query pg_catalog directly from the client without extra permissions.
    // Let's try to see if there's any other policy we can find.

    // Actually, I'll use a direct internal query via a script if possible.
    // But better yet, I'll just check if RLS is REALLY enabled.

    const { data: promptsRls, error: err } = await supabase.rpc('check_rls_enabled', { table_name: 'prompts' });
    console.log('RLS Enabled:', promptsRls);
}

// Since RPCs might not exist, I'll just check the migration files again or use npx supabase db dump
checkPolicies();
