import { authenticatedFetch } from '../lib/authenticatedFetch';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mus-node-production.up.railway.app' : 'http://localhost:3000');

export interface APIKey {
    id: string;
    key: string;
    name: string;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
    lastUsedAt?: string;
}

/**
 * Generate a new API key for the current user
 */
export async function generateAPIKey(name: string): Promise<{ success: boolean; apiKey?: APIKey; error?: string }> {
    try {
        const response = await authenticatedFetch(`${BACKEND_URL}/api/keys/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to generate API key' };
        }

        return { success: true, apiKey: data.apiKey };
    } catch (error) {
        console.error('[API Keys Service] Error generating key:', error);
        return { success: false, error: 'Network error' };
    }
}

let keysCache: Promise<{ success: boolean; apiKeys?: APIKey[]; error?: string }> | null = null;

/**
 * Get all API keys for the current user
 * Uses deduplication to prevent double-firing in StrictMode
 */
export async function getUserAPIKeys(): Promise<{ success: boolean; apiKeys?: APIKey[]; error?: string }> {
    if (keysCache) return keysCache;

    keysCache = (async () => {
        try {
            const response = await authenticatedFetch(`${BACKEND_URL}/api/keys`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to fetch API keys' };
            }

            return { success: true, apiKeys: data.apiKeys };
        } catch (error) {
            console.error('[API Keys Service] Error fetching keys:', error);
            return { success: false, error: 'Network error' };
        } finally {
            // Clear cache after a short delay
            setTimeout(() => { keysCache = null; }, 5000);
        }
    })();

    return keysCache;
}

/**
 * Deactivate an API key
 */
export async function deactivateAPIKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await authenticatedFetch(`${BACKEND_URL}/api/keys/${keyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to deactivate API key' };
        }

        return { success: true };
    } catch (error) {
        console.error('[API Keys Service] Error deactivating key:', error);
        return { success: false, error: 'Network error' };
    }
}
