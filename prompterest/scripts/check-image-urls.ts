import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkData() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    });

    try {
        await client.connect();

        console.log('--- LATEST PROMPTS ---');
        const res = await client.query(`
            SELECT id, title, image_url, user_id 
            FROM public.prompts 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('\n--- STORAGE OBJECTS ---');
        const storageRes = await client.query(`
            SELECT name, bucket_id 
            FROM storage.objects 
            WHERE bucket_id = 'prompt-images' 
            LIMIT 5;
        `);
        console.log(JSON.stringify(storageRes.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkData();
