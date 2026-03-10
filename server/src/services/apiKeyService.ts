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
        if (!keyValue) {
            console.warn('[ApiKeyService] ❌ Validation failed: No key provided');
            return null;
        }

        // Support both 'Bearer <key>' and direct '<key>' (for x-api-key use)
        const cleanKey = keyValue.replace('Bearer ', '').trim();

        try {
            const keyRecord = await db.query.apiKeys.findFirst({
                where: and(
                    eq(apiKeys.key, cleanKey),
                    eq(apiKeys.is_active, true)
                )
            });

            if (!keyRecord) {
                console.warn(`[ApiKeyService] ❌ Validation failed: Key not found or inactive (${cleanKey.substring(0, 10)}...)`);
                return null;
            }

            // Origin Check
            const allowed = (keyRecord.allowed_origins as string[]) || [];

            // If allowed_origins is just ['*'], or empty, it means all origins are allowed.
            const isGlobal = allowed.length === 0 || (allowed.length === 1 && allowed[0] === '*');

            if (!isGlobal) {
                if (!origin) {
                    console.warn(`[ApiKeyService] ❌ Validation failed: Missing Origin header for restricted key "${keyRecord.owner_name}"`);
                    return null;
                }

                const isAllowed = allowed.some((o: string) => origin.startsWith(o) || o === '*');
                if (!isAllowed) {
                    console.warn(`[ApiKeyService] ❌ Validation failed: Origin "${origin}" not allowed for key "${keyRecord.owner_name}"`);
                    return null;
                }
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
            console.error("[ApiKeyService] 💥 Critical Validation Error:", e);
            return null;
        }
    }
}
