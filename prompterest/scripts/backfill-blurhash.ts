import { createClient } from '@supabase/supabase-js';
import { encode } from 'blurhash';
import sharp from 'sharp';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getImageData(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

    return {
        data: new Uint8ClampedArray(data),
        width: info.width,
        height: info.height,
    };
}

async function backfill() {
    console.log('Fetching prompts without blur_hash...');
    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('id, image_url')
        .is('blur_hash', null);

    if (error) {
        console.error('Error fetching prompts:', error);
        return;
    }

    console.log(`Found ${prompts?.length || 0} prompts to process.`);

    for (const prompt of prompts || []) {
        try {
            console.log(`Processing prompt ${prompt.id}: ${prompt.image_url}`);
            const { data, width, height } = await getImageData(prompt.image_url);
            const hash = encode(data, width, height, 4, 4);

            const { error: updateError } = await supabase
                .from('prompts')
                .update({ blur_hash: hash })
                .eq('id', prompt.id);

            if (updateError) {
                console.error(`Error updating prompt ${prompt.id}:`, updateError);
            } else {
                console.log(`Updated prompt ${prompt.id} with hash: ${hash}`);
            }
        } catch (e) {
            console.error(`Failed to process prompt ${prompt.id}:`, e);
        }
    }

    console.log('Backfill complete!');
}

backfill();
