import { db } from '../lib/db.js';
import { appSecrets } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const manageSecret = async (action: string, keyName: string, keyValue?: string) => {
    try {
        if (action === 'set') {
            if (!keyValue) throw new Error("keyValue is required for 'set' action");

            console.log(`Setting secret: ${keyName}...`);
            await db.insert(appSecrets).values({
                id: crypto.randomUUID(),
                key_name: keyName,
                key_value: keyValue,
                updated_at: new Date()
            }).onConflictDoUpdate({
                target: appSecrets.key_name,
                set: {
                    key_value: keyValue,
                    updated_at: new Date()
                }
            });
            console.log(`✓ Secret ${keyName} set successfully.`);

        } else if (action === 'get') {
            const secret = await db.query.appSecrets.findFirst({
                where: eq(appSecrets.key_name, keyName)
            });
            if (secret) {
                console.log(`${keyName}: ${secret.key_value}`);
            } else {
                console.log(`Secret ${keyName} not found.`);
            }

        } else if (action === 'list') {
            const allSecrets = await db.select().from(appSecrets);
            console.log("\nApplication Secrets:");
            console.log("-----------------------------------------");
            allSecrets.forEach(s => {
                console.log(`${s.key_name}: ${s.key_value.substring(0, 4)}...${s.key_value.slice(-4)}`);
            });
            console.log("-----------------------------------------");
        }
    } catch (error: any) {
        console.error("Error managing secret:", error.message);
    }
};

const action = process.argv[2];
const keyName = process.argv[3];
const keyValue = process.argv[4];

if (!action || (action !== 'list' && !keyName)) {
    console.log('Usage:');
    console.log('  npx ts-node src/scripts/manageSecrets.ts set <key_name> <key_value>');
    console.log('  npx ts-node src/scripts/manageSecrets.ts get <key_name>');
    console.log('  npx ts-node src/scripts/manageSecrets.ts list');
} else {
    manageSecret(action, keyName, keyValue);
}
