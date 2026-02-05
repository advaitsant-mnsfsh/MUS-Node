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

    app.use(cors());
    app.use(express.json({ limit: '150mb' }));
    app.use(express.urlencoded({ limit: '150mb', extended: true }));

    app.get('/', (req, res) => {
        res.send('MUS Audit Server is running');
    });

    // Mount Routes
    // Using require to ensure clean load order
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

    // New Endpoint: Claim Audit (Bypass RLS via Admin)
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
            // Admin Update
            const { data, error } = await supabase
                .from('audit_jobs')
                .update({ user_id: user.id })
                .eq('id', auditId)
                .is('user_id', null) // Safety check: only claim if unowned
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

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);

        // Auto-start worker in dev mode for convenience
        // Auto-start worker in dev mode for convenience
        // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        //     console.log('[System] Dev Mode detected: Starting inline Worker...');
        //     require('./workers/auditWorker').startWorker();\n        // }
    });
}
