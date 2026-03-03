import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// IDs de prueba (deben existir tras el seed)
const VICTIM_USER_ID = '11111111-1111-1111-1111-111111111111';
const VICTIM_PROMPT_ID = '38d57e73-be73-4fc8-af2f-f23682abec93';

// Cliente ANON (Simula atacante sin sesión o con sesión diferente)
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Cliente ADMIN (Para verificar estado real)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
    console.log('--- AUDITORÍA DE SEGURIDAD RLS (PROMPTEREST) ---');

    // 1. DELETE ajeno
    console.log('\n[TEST 1] DELETE prompt ajeno...');
    const { error: delError } = await anonClient
        .from('prompts')
        .delete()
        .eq('id', VICTIM_PROMPT_ID);

    // Verificar si sigue ahí
    const { data: stillExists } = await adminClient.from('prompts').select('id').eq('id', VICTIM_PROMPT_ID).single();

    if (delError || stillExists) {
        console.log('\x1b[32m%s\x1b[0m', '✅ RLS Bloqueó la operación (El prompt sigue existiendo)');
    } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ ALERTA: Operación permitida (El prompt fue eliminado)');
    }

    // 2. UPDATE perfil ajeno
    console.log('\n[TEST 2] UPDATE perfil ajeno...');
    const { error: updError } = await anonClient
        .from('profiles')
        .update({ bio: 'Hacked!' })
        .eq('id', VICTIM_USER_ID);

    const { data: profile } = await adminClient.from('profiles').select('bio').eq('id', VICTIM_USER_ID).single();
    if (updError || profile?.bio !== 'Hacked!') {
        console.log('\x1b[32m%s\x1b[0m', '✅ RLS Bloqueó la operación (Perfil intacto)');
    } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ ALERTA: Operación permitida (Perfil vulnerado)');
    }

    // 3. SELECT saved_prompts ajenos
    console.log('\n[TEST 3] SELECT saved_prompts ajenos...');
    const { data: savedData, error: selError } = await anonClient
        .from('saved_prompts')
        .select('*')
        .eq('user_id', VICTIM_USER_ID);

    if (selError || (savedData && savedData.length === 0)) {
        console.log('\x1b[32m%s\x1b[0m', '✅ RLS Bloqueó la operación (No se filtraron datos ajenos)');
    } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ ALERTA: Operación permitida (Acceso a marcadores ajenos)');
    }

    // 4. INSERT saved_prompts con user_id falso
    console.log('\n[TEST 4] INSERT saved_prompts con user_id ajeno...');
    const { error: insError } = await anonClient
        .from('saved_prompts')
        .insert({ user_id: VICTIM_USER_ID, prompt_id: VICTIM_PROMPT_ID });

    if (insError) {
        console.log('\x1b[32m%s\x1b[0m', '✅ RLS Bloqueó la operación (Insert fallido)');
    } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ ALERTA: Operación permitida (Marcador falso insertado)');
    }
}

audit();
