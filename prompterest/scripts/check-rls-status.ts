import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkRLS() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT 
                c.relname as table_name,
                c.relrowsecurity as rls_enabled,
                c.relforcerowsecurity as rls_forced,
                (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) as policy_count
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = 'prompts';
        `);
        console.log(JSON.stringify(res.rows[0], null, 2));

        const policies = await client.query(`
            SELECT policyname, cmd, roles, qual::text as using_clause, with_check::text as check_clause
            FROM pg_policies 
            WHERE tablename = 'prompts';
        `);
        console.log('\n--- POLICIES ---');
        console.table(policies.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkRLS();
