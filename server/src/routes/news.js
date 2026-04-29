import express from 'express';
import { getAll, getOne } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const news = await getAll(`
            SELECT id, title, summary, image_url, published_at
            FROM news
            ORDER BY published_at DESC
            LIMIT 20
        `);
        res.json(news);
    } catch (err) {
        console.error('Get news error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await getOne('SELECT * FROM news WHERE id = ?', [id]);

        if (!newsItem) {
            return res.status(404).json({ error: 'Новость не найдена' });
        }

        res.json(newsItem);
    } catch (err) {
        console.error('Get news item error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;