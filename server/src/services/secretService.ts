import { db } from '../lib/db';
import { appSecrets } from '../db/schema';

export class SecretService {
    static async getSecrets() {
        try {
            const data = await db.select({
                key_name: appSecrets.key_name,
                key_value: appSecrets.key_value
            }).from(appSecrets);

            const secrets = data.reduce((acc: any, item: any) => {
                const key = item.key_name.trim();
                acc[key] = item.key_value;
                return acc;
            }, {});

            console.log(`[SecretService] Loaded ${Object.keys(secrets).length} secrets from DB: ${Object.keys(secrets).join(', ')}`);
            return secrets;
        } catch (e) {
            console.warn("[SecretService] Failed to fetch secrets from DB, using Env Vars only.");
            return {};
        }
    }
}
