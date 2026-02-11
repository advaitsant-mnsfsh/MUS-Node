import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth.js';
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
    // Check for Authorization in both casings (common in some environments)
    const authHeader = (req.headers.authorization || req.headers.Authorization) as string;
    const path = req.originalUrl || req.url;

    const hasSessionCookie = cookies.includes('session_token');
    const hasBearerToken = authHeader?.startsWith('Bearer ');

    try {
        // 1. Fetch Session
        // With 'bearer' plugin enabled, Better-Auth will automatically check
        // both Cookies AND the 'Authorization: Bearer <token>' header.
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            console.warn(`[Auth] ❌ Session fetch failed.`);
            return null;
        }

        // session.session is the actual session object, session.user is the user object
        return session;
    } catch (e) {
        console.error("[Auth-Diagnostic] 💥 Critical Auth Error:", e);
        return null;
    }
}

/**
 * Middleware to REQUIRE Better-Auth Session
 */
export const requireUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
        const sessionData = await getCachedSession(req);

        if (!sessionData) {
            console.warn(`[Auth] requireUserAuth: No session (took ${Date.now() - start}ms)`);
            return res.status(401).json({ error: 'Unauthorized: Session required' });
        }

        (req as AuthenticatedRequest).user = sessionData.user;
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
    // 1. Check Session
    try {
        const sessionData = await getCachedSession(req);
        if (sessionData) {
            const isCached = Date.now() - start < 10;
            // console.log(`[Auth] validateAccess: Found Session (took ${Date.now() - start}ms${isCached ? ' [CACHED]' : ''})`);
            (req as AuthenticatedRequest).user = sessionData.user;
            return next();
        }
    } catch (e) {
        console.error("[Auth] validateAccess: Session check failed", e);
    }

    // 2. Check API Key
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (apiKeyHeader) {
        try {
            const { db } = await import('../lib/db.js');
            const { apiKeys } = await import('../db/schema.js');
            const { eq, and } = await import('drizzle-orm');

            const keyRecord = await db.query.apiKeys.findFirst({
                where: and(
                    eq(apiKeys.key, apiKeyHeader),
                    eq(apiKeys.is_active, true)
                )
            });

            if (keyRecord) {
                // console.log(`[Auth] validateAccess: API Key Verified for ${keyRecord.owner_name}`); // Removed verbose log
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
    const path = req.originalUrl || req.url;
    const cookies = req.headers.cookie || '';
    const hasCookies = cookies.length > 0;

    console.log(`[Auth] optionalUserAuth START for ${path}`);
    console.log(`[Auth] Has Cookies: ${hasCookies}, Cookie Count: ${cookies.split(';').length}`);

    try {
        const session = await getCachedSession(req);

        if (session) {
            const isCached = Date.now() - start < 10;
            console.log(`[Auth] optionalUserAuth: ✅ Found User ${session.user.email} (${session.user.id}) (took ${Date.now() - start}ms${isCached ? ' [CACHED]' : ''})`);
            (req as AuthenticatedRequest).user = session.user;
        } else {
            console.log(`[Auth] optionalUserAuth: ⚠️ No session found (took ${Date.now() - start}ms). Cookies present: ${hasCookies}`);
        }
    } catch (error) {
        console.error('[Auth] optionalUserAuth Error:', error);
    }
    next();
};
