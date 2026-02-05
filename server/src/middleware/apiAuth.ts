import { Request, Response, NextFunction } from 'express';
import { supabase as supabaseAdmin } from '../lib/supabase';

// Extend Express Request to include apiKey info and optional User
export interface AuthenticatedRequest extends Request {
    apiKey?: {
        id: string;
        owner_name: string;
    };
    user?: any; // Supabase User Object
}

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing x-api-key header' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .select('id, owner_name, is_active')
            .eq('key', apiKey)
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Invalid API Key' });
        }

        if (!data.is_active) {
            return res.status(403).json({ error: 'API Key is inactive' });
        }

        // Attach key info to request
        (req as AuthenticatedRequest).apiKey = {
            id: data.id,
            owner_name: data.owner_name
        };

        // Increment usage count (fire and forget, but handled safely)
        supabaseAdmin.rpc('increment_key_usage', { key_id: data.id }).then(({ error }) => {
            if (error) {
                // Fallback if RPC doesn't exist
                supabaseAdmin.from('api_keys').select('usage_count').eq('id', data.id).single()
                    .then(({ data: current }) => {
                        if (current) {
                            supabaseAdmin.from('api_keys').update({ usage_count: current.usage_count + 1 }).eq('id', data.id);
                        }
                    });
            }
        });

        next();
    } catch (err) {
        console.error('Auth Error:', err);
        return res.status(500).json({ error: 'Internal Server Error during Authentication' });
    }
};

/**
 * Middleware to optionally check for Supabase Auth Token (Bearer)
 * Used for tracking "Which user ran this audit?"
 */
export const optionalUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log(`[Auth] Checking Header: ${authHeader ? 'Present' : 'Missing'}`);

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && user) {
                console.log(`[Auth] Verified User: ${user.id}`);
                (req as AuthenticatedRequest).user = user;
            } else {
                console.log(`[Auth] Verification Failed: ${error?.message}`);
            }
        } catch (err) {
            console.error('[Auth] Token Check Error:', err);
        }
    }
    next();
};
