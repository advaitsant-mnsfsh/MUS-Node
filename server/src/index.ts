import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { optionalUserAuth, AuthenticatedRequest } from './middleware/apiAuth';
import { db, preWarmDatabase } from './lib/db';
import { auditJobs } from './db/schema';
import { eq, isNull, and } from 'drizzle-orm';

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3000;

// --- 1. VERBOSE LOGGING (Must be absolute first) ---
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// --- 2. CRITICAL HEALTH CHECKS (Must be before any heavy logic) ---
app.get("/", (req: any, res: any) => {
    res.status(200).send("OK");
});

app.get("/health", (req: any, res: any) => {
    res.status(200).json({ status: "healthy" });
});

app.use(compression());
app.use(cors({
    origin: function (origin, callback) {
        return callback(null, true); // Permissive for health probes
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cache-Control', 'Pragma', 'Accept']
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 3. BUSINESS ROUTES ---
import apiRoutes from './api/routes';
import externalRoutes from './api/external';
import publicRoutes from './api/public';
import apiKeysRoutes from './routes/apiKeys';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/keys', apiKeysRoutes);

app.post('/api/audit/claim', optionalUserAuth, async (req: any, res: any) => {
    const user = (req as AuthenticatedRequest).user;
    const { auditId } = req.body;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!auditId) return res.status(400).json({ success: false, error: 'Missing auditId' });

    try {
        const [updated] = await db.update(auditJobs)
            .set({ user_id: user.id })
            .where(and(eq(auditJobs.id, auditId), isNull(auditJobs.user_id)))
            .returning({ id: auditJobs.id });

        if (!updated) return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });
        return res.json({ success: true });
    } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

// --- 4. SYSTEM INITIALIZATION ---
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(port, () => {
    console.log(`[System] Instance born at: ${new Date().toISOString()}`);
    console.log(`[System] Server running on port: ${port}`);
    console.log(`[System] Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

    // Non-blocking Pre-warm
    preWarmDatabase().catch(err => console.error('[DB] Pre-warm failed:', err.message));
});

let isShuttingDown = false;
const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[System] Received ${signal}. Starting 10s graceful shutdown...`);

    server.close(() => {
        console.log('[System] Server connections closed.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('[System] Shutdown timed out. Forcing exit.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

setInterval(() => {
    console.log(`[Keepalive] Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 60000);
