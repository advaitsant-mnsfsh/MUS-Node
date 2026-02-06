import { db } from '../lib/db';
import { appSecrets } from '../db/schema';

export class SecretService {
    static async getSecrets() {
        try {
            const data = await db.select({
                key_name: appSecrets.key_name,
                key_value: appSecrets.key_value
            }).from(appSecrets);

            return data.reduce((acc: any, item: any) => {
                acc[item.key_name] = item.key_value;
                return acc;
            }, {});
        } catch (e) {
            console.warn("[SecretService] Failed to fetch secrets from DB, using Env Vars only.");
            return {};
        }
    }
}
