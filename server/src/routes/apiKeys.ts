import { Router, Request, Response } from 'express';
// import { createClient } from '@supabase/supabase-js'; // Removed
import { supabase } from '../lib/supabase'; // Use singleton
import crypto from 'crypto';

const router = Router();

// const supabaseUrl = process.env.SUPABASE_URL!;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * POST /api/keys/generate
 * Generate a new API key for the authenticated user
 */
router.post('/generate', async (req: Request, res: Response) => {
    try {
        // Get user from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the user's session
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'API key name is required' });
        }

        // Generate a secure random key
        const prefix = 'mus_live_';
        const randomPart = crypto.randomBytes(16).toString('hex');
        const apiKey = `${prefix}${randomPart}`;

        // Insert into api_keys table
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                key: apiKey,
                owner_name: name.trim(),
                user_id: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('[API Keys] Error creating key:', error);
            return res.status(500).json({ error: 'Failed to create API key' });
        }

        console.log(`[API Keys] Created new key for user ${user.id}: ${data.id}`);

        res.json({
            success: true,
            apiKey: {
                id: data.id,
                key: data.key,
                name: data.owner_name,
                createdAt: data.created_at,
                usageCount: data.usage_count,
                isActive: data.is_active
            }
        });

    } catch (error) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/keys
 * Get all API keys for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        // Get user from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the user's session
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        // Fetch all API keys for this user
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, key, owner_name, usage_count, is_active, created_at, last_used_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[API Keys] Error fetching keys:', error);
            return res.status(500).json({ error: 'Failed to fetch API keys' });
        }

        res.json({
            success: true,
            apiKeys: data.map(key => ({
                id: key.id,
                key: key.key,
                name: key.owner_name,
                usageCount: key.usage_count,
                isActive: key.is_active,
                createdAt: key.created_at,
                lastUsedAt: key.last_used_at
            }))
        });

    } catch (error) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/keys/:keyId
 * Deactivate an API key
 */
router.delete('/:keyId', async (req: Request, res: Response) => {
    try {
        // Get user from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the user's session
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        const { keyId } = req.params;

        // Deactivate the key (only if it belongs to this user)
        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId)
            .eq('user_id', user.id);

        if (error) {
            console.error('[API Keys] Error deactivating key:', error);
            return res.status(500).json({ error: 'Failed to deactivate API key' });
        }

        console.log(`[API Keys] Deactivated key ${keyId} for user ${user.id}`);

        res.json({ success: true });

    } catch (error) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
