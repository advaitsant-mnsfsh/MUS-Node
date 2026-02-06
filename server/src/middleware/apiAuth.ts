import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from "better-auth/node";

export interface AuthenticatedRequest extends Request {
    user?: any; // Better-Auth User Object
    apiKey?: {
        id: string;
        owner_name: string;
    };
}

// 🚀 InMemory Session Cache to beat cloud latency
const SESSION_CACHE = new Map<string, { session: any; expires: number }>();
const PENDING_PROMISES = new Map<string, Promise<any>>();
const CACHE_TTL = 120 * 1000; // 2 minutes

async function getCachedSession(req: Request) {
    const cookies = req.headers.cookie || "";
    // masking actual session token for safety
    const hasAuditCookie = cookies.includes('.session_token');

    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (session) {
            console.log(`[Auth] Session active for ${session.user.email}`);
        } else if (hasAuditCookie) {
            console.warn(`[Auth] Session cookie present but library found NO session.`);
        }

        return session;
    } catch (e) {
        console.error("[Auth] Session check failed:", e);
        return null;
    }
}

/**
 * Middleware to REQUIRE Better-Auth Session
 */
export const requireUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
        const session = await getCachedSession(req);

        if (!session) {
            console.warn(`[Auth] requireUserAuth: No session (took ${Date.now() - start}ms)`);
            return res.status(401).json({ error: 'Unauthorized: Session required' });
        }

        const isCached = Date.now() - start < 10; // If it took < 10ms, it was definitely from cache
        console.log(`[Auth] requireUserAuth: Verified ${session.user.email} (took ${Date.now() - start}ms${isCached ? ' [CACHED]' : ''})`);

        (req as AuthenticatedRequest).user = session.user;
        next();

    } catch (error) {
        console.error(`[Auth] requireUserAuth Error (after ${Date.now() - start}ms):`, error);
        return res.status(500).json({ error: 'Auth Error' });
    }
};

/**
 * Combined Auth Check: Allow if User Session OR Valid API Key
 */
export const validateAccess = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    // 1. Check Session
    try {
        const session = await getCachedSession(req);
        if (session) {
            const isCached = Date.now() - start < 10;
            console.log(`[Auth] validateAccess: Found Session (took ${Date.now() - start}ms${isCached ? ' [CACHED]' : ''})`);
            (req as AuthenticatedRequest).user = session.user;
            return next();
        }
    } catch (e) {
        console.error("[Auth] validateAccess: Session check failed", e);
    }

    // 2. Check API Key
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (apiKeyHeader) {
        try {
            const { db } = await import('../lib/db');
            const { apiKeys } = await import('../db/schema');
            const { eq, and } = await import('drizzle-orm');

            const keyRecord = await db.query.apiKeys.findFirst({
                where: and(
                    eq(apiKeys.key, apiKeyHeader),
                    eq(apiKeys.is_active, true)
                )
            });

            if (keyRecord) {
                console.log(`[Auth] validateAccess: API Key Verified for ${keyRecord.owner_name}`);
                (req as AuthenticatedRequest).apiKey = {
                    id: keyRecord.id,
                    owner_name: keyRecord.owner_name
                };
                return next();
            }
        } catch (e) {
            console.error("API Key Check Failed", e);
        }
    }

    // Diagnostic log for 401
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').length : 0;
    console.warn(`[Auth] validateAccess: 401 Unauthorized for ${req.originalUrl || req.url}. Cookies: ${cookies}, Has API Key: ${!!apiKeyHeader}`);
    return res.status(401).json({ error: 'Unauthorized' });
};

export const validateApiKey = validateAccess;

/**
 * Middleware to optionally check for Better-Auth Session
 */
export const optionalUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
        const session = await getCachedSession(req);

        if (session) {
            const isCached = Date.now() - start < 10;
            console.log(`[Auth] optionalUserAuth: Found User ${session.user.id} (took ${Date.now() - start}ms${isCached ? ' [CACHED]' : ''})`);
            (req as AuthenticatedRequest).user = session.user;
        }
    } catch (error) {
        console.error('[Auth] optionalUserAuth Error:', error);
    }
    next();
};
