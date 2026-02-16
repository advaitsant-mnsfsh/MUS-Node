import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { optionalUserAuth, AuthenticatedRequest } from './middleware/apiAuth.js';
import { db, preWarmDatabase } from './lib/db.js';
import { auditJobs } from './db/schema.js';
import { eq, isNull, and } from 'drizzle-orm';

dotenv.config({ path: './.env' });

const app = express();
const port = Number(process.env.PORT) || 8080;

/**
 * SELF-HEALING PORT RECOVERY
 * Kills any orphaned Node processes on 8080 before starting.
 */
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT_NAME) {
    try {
        console.log(`[System] 🔍 Checking port ${port}...`);
        // Windows command to find and kill process on port
        execSync(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`, { stdio: 'ignore' });
        console.log(`[System] ✨ Port ${port} cleared from previous session.`);
    } catch (e) {
        // Port already free, which is good
    }
}

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
        if (!origin) return callback(null, true);
        return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-password', 'Cache-Control', 'Pragma', 'Accept', 'Cookie']
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 3. BUSINESS ROUTES ---
const uploadsDir = path.resolve(process.cwd(), 'uploads');
console.log(`[System] Initializing Uploads Directory: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
    console.log(`[System] Creating missing uploads directory...`);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Diagnostic Middleware for Uploads
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
}, express.static(uploadsDir, {
    maxAge: '1h',
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

import apiRoutes from './api/routes.js';
import externalRoutes from './api/external.js';
import publicRoutes from './api/public.js';
import apiKeysRoutes from './routes/apiKeys.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/keys', apiKeysRoutes);

// --- SERVE FRONTEND (Production) ---
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
    console.log(`[System] Serving Frontend from: ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
} else {
    console.log(`[System] Frontend build not found at: ${clientBuildPath}`);
}


// Legacy Claim Route (for backward compatibility during deployment)
app.post('/api/audit/claim', optionalUserAuth, async (req: any, res: any) => {
    const user = (req as AuthenticatedRequest).user;
    const { auditId } = req.body;
    console.log(`[Claim-Legacy] Request for Audit: ${auditId}, User: ${user?.email || 'UNDEFINED'}`);

    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No active session found.' });
    }

    if (!auditId) return res.status(400).json({ success: false, error: 'Missing auditId' });

    try {
        const [updated] = await db.update(auditJobs)
            .set({ user_id: user.id })
            .where(and(eq(auditJobs.id, auditId), isNull(auditJobs.user_id)))
            .returning({ id: auditJobs.id });

        if (!updated) return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });

        console.log(`[Claim-Legacy] ✅ Successfully assigned audit ${auditId} to user ${user.email}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error(`[Claim-Legacy] 💥 Error:`, e);
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

// --- SHUTDOWN HANDLING ---
let isShuttingDown = false;
export const getIsShuttingDown = () => isShuttingDown;

const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[System] Received ${signal}. Starting graceful shutdown...`);

    const timeout = process.env.RAILWAY_ENVIRONMENT_NAME ? 10000 : 1000;

    server.close(() => {
        console.log('[System] Server connections closed.');
        process.exit(0);
    });

    setTimeout(() => {
        console.log(`[System] Shutdown complete after ${timeout}ms.`);
        process.exit(0);
    }, timeout);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const ENV_NAME = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'development';

const server = app.listen(port, async () => {
    console.log(`[System] Instance born at: ${new Date().toISOString()}`);
    console.log(`[System] Environment: ${ENV_NAME}`);
    console.log(`[System] Server running on port: ${port}`);
    console.log(`[System] Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

    try {
        await preWarmDatabase();
        // Start the background worker
        const { WorkerService } = await import('./services/workerService.js');
        WorkerService.start();
    } catch (err) {
        console.warn('[System] Database pre-warm or Worker start failed, but server is listening.');
    }

    console.log(`[System] 🚀 Post-Deploy sequence complete. Ready for requests in ${ENV_NAME}.`);
});
