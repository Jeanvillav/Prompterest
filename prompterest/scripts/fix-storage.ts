import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixStorage() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    });

    try {
        await client.connect();

        // 1. Create Bucket
        console.log('Ensuring prompt-images bucket exists...');
        await client.query(`
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('prompt-images', 'prompt-images', true)
            ON CONFLICT (id) DO NOTHING;
        `);

        // 2. Verify Bucket
        const bucketRes = await client.query("SELECT * FROM storage.buckets WHERE id = 'prompt-images'");
        console.log('Bucket status:', bucketRes.rows[0] ? '✅ Created' : '❌ Failed');

        // 3. Verify Policies
        const policyRes = await client.query(`
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'objects' AND schemaname = 'storage';
        `);
        console.log('Current Storage Policies:', policyRes.rows.map(r => r.policyname));

    } catch (err) {
        console.error('Error fixing storage:', err);
    } finally {
        await client.end();
    }
}

fixStorage();
