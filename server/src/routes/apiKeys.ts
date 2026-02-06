import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { apiKeys } from '../db/schema';
import { requireUserAuth, AuthenticatedRequest } from '../middleware/apiAuth';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/keys/generate
 * Generate a new API key for the authenticated user
 */
router.post('/generate', requireUserAuth, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user;

        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'API key name is required' });
        }

        // Generate a secure random key
        const prefix = 'mus_live_';
        const randomPart = crypto.randomBytes(16).toString('hex');
        const apiKey = `${prefix}${randomPart}`;

        // Insert into api_keys table via Drizzle
        const [newKey] = await db.insert(apiKeys).values({
            id: crypto.randomUUID(),
            key: apiKey,
            owner_name: name.trim(),
            user_id: user.id
        }).returning();

        if (!newKey) {
            throw new Error("Failed to create key record");
        }

        console.log(`[API Keys] Created new key for user ${user.id}: ${newKey.id}`);

        res.json({
            success: true,
            apiKey: {
                id: newKey.id,
                key: newKey.key,
                name: newKey.owner_name,
                createdAt: newKey.created_at,
                usageCount: newKey.usage_count,
                isActive: newKey.is_active
            }
        });

    } catch (error: any) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

/**
 * GET /api/keys
 * Get all API keys for the authenticated user
 */
router.get('/', requireUserAuth, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user;

        // Fetch all API keys for this user via Drizzle
        const results = await db.query.apiKeys.findMany({
            where: eq(apiKeys.user_id, user.id),
            orderBy: [desc(apiKeys.created_at)]
        });

        res.json({
            success: true,
            apiKeys: results.map((key) => ({
                id: key.id,
                key: key.key,
                name: key.owner_name,
                usageCount: key.usage_count,
                isActive: key.is_active,
                createdAt: key.created_at,
                lastUsedAt: key.last_used_at
            }))
        });

    } catch (error: any) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

/**
 * DELETE /api/keys/:keyId
 * Deactivate an API key
 */
router.delete('/:keyId', requireUserAuth, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const user = authReq.user;
        const { keyId } = req.params;

        // Deactivate the key (only if it belongs to this user) via Drizzle
        const [updated] = await db.update(apiKeys)
            .set({ is_active: false })
            .where(and(
                eq(apiKeys.id, keyId),
                eq(apiKeys.user_id, user.id)
            ))
            .returning();

        if (!updated) {
            return res.status(404).json({ error: 'API key not found or unauthorized' });
        }

        console.log(`[API Keys] Deactivated key ${keyId} for user ${user.id}`);

        res.json({ success: true });

    } catch (error: any) {
        console.error('[API Keys] Unexpected error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

export default router;
