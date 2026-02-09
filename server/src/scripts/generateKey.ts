import { db } from '../lib/db.js';
import { apiKeys } from '../db/schema.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const generateKey = async (ownerName: string, userId: string) => {
    // Generate a secure random key
    const prefix = 'mus_live_';
    const randomPart = crypto.randomBytes(16).toString('hex');
    const apiKey = `${prefix}${randomPart}`;

    console.log(`Generating key for: ${ownerName}...`);

    try {
        const [newKey] = await db.insert(apiKeys).values({
            id: crypto.randomUUID(),
            key: apiKey,
            owner_name: ownerName,
            user_id: userId
        }).returning();

        console.log('\nSUCCESS! New API Key Created:');
        console.log('------------------------------------------------');
        console.log(`Owner: ${newKey.owner_name}`);
        console.log(`Key:   ${newKey.key}`);
        console.log('------------------------------------------------');
        console.log('Share this key securely. It allows access to the Audit API.');
    } catch (error: any) {
        console.error('Error creating key:', error.message);
    }
};

const owner = process.argv[2];
const userId = process.argv[3];

if (!owner || !userId) {
    console.log('Usage: npx ts-node src/scripts/generateKey.ts "Owner Name" "User ID"');
} else {
    generateKey(owner, userId);
}
