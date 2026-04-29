import express from 'express';
import { getAll } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, region } = req.query;

        let sql = `
            SELECT
                pp.id,
                pp.full_name,
                pp.education_org,
                pp.category,
                pp.region,
                COALESCE(SUM(e.total_score), 0) as total_score,
                COUNT(e.id) as evaluated_count,
                MIN(e.created_at) as first_evaluation_date
            FROM participant_profiles pp
            LEFT JOIN submissions s ON pp.id = s.participant_id
            LEFT JOIN evaluations e ON s.id = e.submission_id
            WHERE e.id IS NOT NULL
        `;
        const params = [];

        if (category) {
            sql += ' AND pp.category = ?';
            params.push(category);
        }
        if (region) {
            sql += ' AND pp.region LIKE ?';
            params.push(`%${region}%`);
        }

        sql += `
            GROUP BY pp.id
            ORDER BY total_score DESC, first_evaluation_date ASC
            LIMIT 100
        `;

        let rating = await getAll(sql, params);
        rating = rating.slice(0, 10);

        res.json(rating);
    } catch (err) {
        console.error('Get rating error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;