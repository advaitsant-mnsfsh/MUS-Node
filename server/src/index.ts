import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAuditRequest } from './audit';
import { optionalUserAuth, AuthenticatedRequest } from './middleware/apiAuth';
import { supabase } from './lib/supabase';

dotenv.config();

// CHECK MODE
if (process.env.RUN_WORKER === 'true') {
    // WORKER MODE
    console.log('[System] Mode: WORKER. Starting Job Consumer...');
    // Lazy load worker to avoid initializing it in API mode
    require('./workers/auditWorker').startWorker();

} else {
    // API MODE
    console.log('[System] Mode: API. Starting Web Server...');

    const app = express();
    const port = process.env.PORT || 3000;

    // --- CRITICAL HEALTH CHECKS (Must be first) ---
    const healthHandler = (req: any, res: any) => {
        // console.log(`[System] Health Ping (${req.method}) from ${req.ip}`);
        res.status(200).send('OK');
    };

    app.get('/', healthHandler);
    app.head('/', healthHandler);
    app.get('/health', healthHandler);

    console.log('[System] Health routes registered (/, /health)');

    app.use(cors({
        origin: function (origin, callback) {
            const allowedOrigins = [
                'https://mus-node.vercel.app',
                'http://localhost:5173',
                'http://localhost:3000',
                process.env.CLIENT_URL,
                'https://sobtfbplbpvfqeubjxex.supabase.co'
            ].filter(Boolean);

            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1 && !allowedOrigins.includes('*')) {
                console.log('[CORS] Origin:', origin);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    }));
    app.use(express.json({ limit: '150mb' }));
    app.use(express.urlencoded({ limit: '150mb', extended: true }));

    // Mount Routes
    const apiRoutes = require('./api/routes').default;
    const externalRoutes = require('./api/external').default;
    const publicRoutes = require('./api/public').default;
    const apiKeysRoutes = require('./routes/apiKeys').default;

    app.use('/api/v1', apiRoutes);
    app.use('/api/external', externalRoutes);
    app.use('/api/public', publicRoutes);
    app.use('/api/keys', apiKeysRoutes);

    console.log('✓ API routes mounted: /api/v1, /api/external, /api/public, /api/keys');

    // Direct Audit Handling
    const auditHandler = async (req: any, res: any) => {
        try {
            await handleAuditRequest(req, res);
        } catch (error: any) {
            console.error('Unhandled server error:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: error.message || 'Internal Server Error' });
            }
        }
    };

    app.post('/api/audit', optionalUserAuth, auditHandler);
    app.get('/api/audit', auditHandler);

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
            const { data, error } = await supabase
                .from('audit_jobs')
                .update({ user_id: user.id })
                .eq('id', auditId)
                .is('user_id', null)
                .select('id');

            if (error) {
                console.error('[Admin] DB Error:', error);
                return res.status(500).json({ success: false, error: error.message });
            }

            if (!data || data.length === 0) {
                return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });
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
    app.listen(Number(port), HOST, () => {
        console.log(`Server running on ${HOST}:${port}`);
        console.log(`[System] Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    });
}
