import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { optionalUserAuth, AuthenticatedRequest } from './middleware/apiAuth';
import { db } from './lib/db';
import { auditJobs } from './db/schema';
import { eq, isNull, and } from 'drizzle-orm';

dotenv.config({ path: './.env' });

console.log('[DEBUG] CWD:', process.cwd());
console.log('[DEBUG] PORT from Env:', process.env.PORT);

// CHECK MODE
// API MODE
console.log('[System] Starting Web Server...');

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());

// --- CRITICAL HEALTH CHECKS (Must be first) ---
// MUST be before auth middleware and routes
app.get("/", (req: any, res: any) => {
    res.status(200).send("OK");
});

app.get("/health", (req: any, res: any) => {
    res.status(200).json({ status: "healthy" });
});

console.log('[System] Health routes registered (/, /health)');

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://mus-node.vercel.app',
            'http://localhost:5173',
            'http://localhost:8080',
            process.env.CLIENT_URL,
        ].filter(Boolean);

        if (!origin) return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cache-Control', 'Pragma', 'Accept']
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Mount Routes
import apiRoutes from './api/routes';
import externalRoutes from './api/external';
import publicRoutes from './api/public';
import apiKeysRoutes from './routes/apiKeys';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

app.use('/api', authRoutes); // mounts at /api/auth/*
app.use('/api/user', userRoutes); // mounts at /api/user/*
app.use('/api/v1', apiRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/keys', apiKeysRoutes);

console.log('✓ API routes mounted: /api/v1, /api/external, /api/public, /api/keys');

app.post('/api/audit/claim', optionalUserAuth, async (req: any, res: any) => {
    const user = (req as AuthenticatedRequest).user;
    const { auditId } = req.body;

    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
    }
    if (!auditId) {
        return res.status(400).json({ success: false, error: 'Missing auditId' });
    }

    console.log(`[Admin] Claim Request: Audit ${auditId} -> User ${user.id}`);

    try {
        // Updated to Drizzle
        const [updated] = await db.update(auditJobs)
            .set({ user_id: user.id })
            .where(and(
                eq(auditJobs.id, auditId),
                isNull(auditJobs.user_id)
            ))
            .returning({ id: auditJobs.id });

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });
        }

        if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_CHROME !== 'true') {
            throw new Error("Misconfigured Scraper: Local Puppeteer launch blocked in Production to prevent crash. Please ensure 'PUPPETEER_BROWSER_ENDPOINT' secret is set correctly in ENV.");
        }

        console.log(`[Admin] Successfully claimed audit ${auditId}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error('[Admin] Claim Exception:', e);
        return res.status(500).json({ success: false, error: e.message });
    }
});

// --- SYSTEM OBSERVABILITY ---
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const HOST = '0.0.0.0';
const server = app.listen(Number(port), HOST, () => {
    console.log(`Server running on ${HOST}:${port}`);
    console.log(`[System] Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log('[System] Server is ready to accept connections');
});

// Prevent premature shutdown
let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) {
        console.log(`[System] Already shutting down, ignoring ${signal}`);
        return;
    }
    isShuttingDown = true;
    console.log(`[System] Received ${signal}, starting graceful shutdown...`);

    server.close(() => {
        console.log('[System] HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('[System] Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Keepalive heartbeat
setInterval(() => {
    console.log(`[Keepalive] Server alive - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 30000); // Every 30 seconds
