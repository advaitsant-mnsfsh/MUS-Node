import { db } from '../lib/db.js';
import { apiKeys } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export interface ApiKeyDetails {
    id: string;
    owner_name: string;
    allowed_origins: string[];
}

export class ApiKeyService {
    /**
     * Validates an API key and checks if the origin is allowed.
     * @param keyValue The raw API key string from the header.
     * @param origin The Origin header from the request.
     * @returns ApiKeyDetails if valid, null otherwise.
     */
    static async validateKey(keyValue: string, origin: string | undefined): Promise<ApiKeyDetails | null> {
        if (!keyValue) return null;

        // Remove 'Bearer ' prefix if present
        const cleanKey = keyValue.replace('Bearer ', '').trim();

        try {
            const keyRecord = await db.query.apiKeys.findFirst({
                where: and(
                    eq(apiKeys.key, cleanKey),
                    eq(apiKeys.is_active, true)
                )
            });

            if (!keyRecord) {
                return null;
            }

            // Origin Check
            const allowed = (keyRecord.allowed_origins as string[]) || [];
            if (allowed.length > 0) {
                if (!origin) return null; // Origin required if restrictions exist

                const isAllowed = allowed.some((o: string) => origin.startsWith(o) || o === '*');
                if (!isAllowed) return null;
            }

            // Increment usage count (optional, fire-and-forget)
            db.update(apiKeys)
                .set({
                    usage_count: keyRecord.usage_count + 1,
                    last_used_at: new Date()
                })
                .where(eq(apiKeys.id, keyRecord.id))
                .execute()
                .catch(e => console.error("[ApiKeyService] Failed to update usage count", e));

            return {
                id: keyRecord.id,
                owner_name: keyRecord.owner_name,
                allowed_origins: allowed
            };
        } catch (e) {
            console.error("[ApiKeyService] Validation Error:", e);
            return null;
        }
    }
}
