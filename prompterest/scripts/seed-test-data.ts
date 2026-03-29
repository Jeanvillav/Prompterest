import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log('Inserting test user...');
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'test@example.com',
        email_confirm: true
    });

    if (userError && !userError.message.includes('already exists')) {
        console.error('Error inserting user:', userError);
    }

    console.log('Inserting test prompt...');
    const { error: promptError } = await supabase
        .from('prompts')
        .insert({
            id: '38d57e73-be73-4fc8-af2f-f23682abec93',
            user_id: '11111111-1111-1111-1111-111111111111',
            title: 'Test Prompt',
            prompt_text: 'A beautiful sunset',
            media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
            media_type: 'image',
            ai_models: ['Midjourney']
        });

    if (promptError) {
        console.error('Error inserting prompt:', promptError);
    } else {
        console.log('Test data inserted successfully!');
    }
}

seed();
