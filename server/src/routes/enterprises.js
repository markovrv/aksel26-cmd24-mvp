import express from 'express';
import { getAll, getOne } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, region } = req.query;

        let sql = `
            SELECT ep.*, u.status as user_status
            FROM enterprise_profiles ep
            JOIN users u ON ep.user_id = u.id
            WHERE ep.moderation_status = 'approved'
        `;
        const params = [];

        if (search) {
            sql += ` AND ep.company_name LIKE ?`;
            params.push(`%${search}%`);
        }
        if (region) {
            sql += ` AND ep.region LIKE ?`;
            params.push(`%${region}%`);
        }

        sql += ` ORDER BY ep.company_name ASC`;

        const enterprises = await getAll(sql, params);

        for (const ent of enterprises) {
            const caseCount = await getOne('SELECT COUNT(*) as count FROM cases WHERE enterprise_id = ? AND status = ?', [ent.id, 'open']);
            ent.active_cases = caseCount?.count || 0;
        }

        res.json(enterprises);
    } catch (err) {
        console.error('Get enterprises error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const enterprise = await getOne(`
            SELECT ep.*, u.status as user_status
            FROM enterprise_profiles ep
            JOIN users u ON ep.user_id = u.id
            WHERE ep.id = ?
        `, [id]);

        if (!enterprise) {
            return res.status(404).json({ error: 'Предприятие не найдено' });
        }

        const cases = await getAll('SELECT * FROM cases WHERE enterprise_id = ? ORDER BY created_at DESC', [id]);
        enterprise.cases = cases;

        res.json(enterprise);
    } catch (err) {
        console.error('Get enterprise error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;