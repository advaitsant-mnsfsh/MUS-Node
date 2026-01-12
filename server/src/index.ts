import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAuditRequest } from './audit';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import apiRoutes from './api/routes';

// ...
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('MUS Audit Server is running');
});

// Mount External API
import externalRoutes from './api/external';
app.use('/api/v1', apiRoutes);
app.use('/api/external', externalRoutes);
app.post('/api/audit', async (req, res) => {
    try {
        await handleAuditRequest(req, res);
    } catch (error: any) {
        console.error('Unhandled server error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message || 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
