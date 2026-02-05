import { supabase } from '../lib/supabase';

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

        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key', cleanKey)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return null;
        }

        // Origin Check
        // If allowed_origins is empty or null, we might allow all (dev mode) or none. 
        // STRICT MODE: Must match.
        // If origin is undefined (server-to-server), we might allow if configured, but for widget, origin is required.

        const allowed = data.allowed_origins || [];
        if (allowed.length > 0) {
            if (!origin) return null; // Origin required if restrictions exist

            const isAllowed = allowed.some((o: string) => origin.startsWith(o) || o === '*');
            if (!isAllowed) return null;
        }

        // Increment usage count (optional, fire-and-forget)
        supabase.rpc('increment_key_usage', { key_id: data.id }).then(({ error }) => {
            if (error) {
                // Fallback if RPC doesn't exist
                supabase.from('api_keys').update({ usage_count: data.usage_count + 1 }).eq('id', data.id);
            }
        });

        return {
            id: data.id,
            owner_name: data.owner_name,
            allowed_origins: data.allowed_origins
        };
    }
}
