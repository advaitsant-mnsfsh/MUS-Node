import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAuditRequest } from './audit';

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

    app.use('/api/v1', apiRoutes);
    app.use('/api/external', externalRoutes);
    app.use('/api/public', publicRoutes);

    console.log('✓ API routes mounted: /api/v1, /api/external, /api/public');

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

    app.post('/api/audit', auditHandler);
    app.get('/api/audit', auditHandler);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);

        // Auto-start worker in dev mode for convenience
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            console.log('[System] Dev Mode detected: Starting inline Worker...');
            require('./workers/auditWorker').startWorker();
        }
    });
}
