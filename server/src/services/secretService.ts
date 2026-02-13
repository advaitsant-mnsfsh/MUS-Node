import { db } from '../lib/db.js';
import { appSecrets } from '../db/schema.js';

export class SecretService {
    private static cache: any = null;
    private static lastFetch = 0;
    private static TTL = 5 * 60 * 1000; // 5 minutes

    static async getSecrets() {
        const now = Date.now();
        if (this.cache && (now - this.lastFetch < this.TTL)) {
            return this.cache;
        }

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

            this.cache = secrets;
            this.lastFetch = now;

            console.log(`[SecretService] 🔄 Refreshed ${Object.keys(secrets).length} secrets from DB.`);
            return secrets;
        } catch (e) {
            console.warn("[SecretService] Failed to fetch secrets from DB, using Env Vars or Cache.");
            return this.cache || {};
        }
    }
}
