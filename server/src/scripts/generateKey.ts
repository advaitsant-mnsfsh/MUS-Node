import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const generateKey = async (ownerName: string) => {
    // Generate a secure random key
    const prefix = 'mus_live_';
    const randomPart = crypto.randomBytes(16).toString('hex');
    const apiKey = `${prefix}${randomPart}`;

    console.log(`Generating key for: ${ownerName}...`);

    const { data, error } = await supabase
        .from('api_keys')
        .insert({
            key: apiKey,
            owner_name: ownerName
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating key:', error.message);
        return;
    }

    console.log('\nSUCCESS! New API Key Created:');
    console.log('------------------------------------------------');
    console.log(`Owner: ${data.owner_name}`);
    console.log(`Key:   ${data.key}`);
    console.log('------------------------------------------------');
    console.log('Share this key securely. It allows access to the Audit API.');
};

const owner = process.argv[2];
if (!owner) {
    console.log('Usage: npx ts-node src/scripts/generateKey.ts "Owner Name"');
} else {
    generateKey(owner);
}
