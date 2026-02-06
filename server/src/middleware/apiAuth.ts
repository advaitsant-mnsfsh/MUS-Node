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

/**
 * Helper to get session with local memory caching & request collapsing
 */
async function getCachedSession(req: Request) {
    const authCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('better-auth.session_token'));

    if (!authCookie) return null;

    // 1. Check Memory Cache (Instant)
    const cached = SESSION_CACHE.get(authCookie);
    if (cached && Date.now() < cached.expires) {
        return cached.session;
    }

    // 2. Request Collapsing: If a request for this token is already in flight, wait for it
    if (PENDING_PROMISES.has(authCookie)) {
        return PENDING_PROMISES.get(authCookie);
    }

    // 3. Cache miss: hit the DB and track the promise
    const sessionPromise = (async () => {
        try {
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            });

            if (session) {
                SESSION_CACHE.set(authCookie, {
                    session,
                    expires: Date.now() + CACHE_TTL
                });
            }
            return session;
        } finally {
            PENDING_PROMISES.delete(authCookie);
        }
    })();

    PENDING_PROMISES.set(authCookie, sessionPromise);
    return sessionPromise;
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
                console.log(`[Auth] validateAccess: API Key Verified (took ${Date.now() - start}ms)`);
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
