import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import casesRoutes from './routes/cases.js';
import enterprisesRoutes from './routes/enterprises.js';
import participantsRoutes from './routes/participants.js';
import enterpriseRoutes from './routes/enterprise.js';
import adminRoutes from './routes/admin.js';
import ratingRoutes from './routes/rating.js';
import newsRoutes from './routes/news.js';
import filesRoutes from './routes/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))



app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/enterprises', enterprisesRoutes);
app.use('/api/participant', participantsRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/files', filesRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.message === 'Только PDF, DOCX, PPTX файлы') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});