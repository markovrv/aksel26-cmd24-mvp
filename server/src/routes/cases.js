import express from 'express';
import { getAll, getOne } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { enterprise, category, status, search, sort } = req.query;

        let sql = `
            SELECT c.*, e.company_name as enterprise_name, e.region as enterprise_region
            FROM cases c
            JOIN enterprise_profiles e ON c.enterprise_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (enterprise) {
            sql += ` AND c.enterprise_id = ?`;
            params.push(enterprise);
        }
        if (status) {
            sql += ` AND c.status = ?`;
            params.push(status);
        }
        if (search) {
            sql += ` AND (c.title LIKE ? OR c.short_description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            sql += ` AND c.id IN (SELECT case_id FROM case_category_links WHERE category = ?)`;
            params.push(category);
        }

        if (sort === 'deadline') {
            sql += ` ORDER BY c.deadline ASC`;
        } else {
            sql += ` ORDER BY c.created_at DESC`;
        }

        const cases = await getAll(sql, params);

        for (const c of cases) {
            const categories = await getAll('SELECT category FROM case_category_links WHERE case_id = ?', [c.id]);
            c.categories = categories.map(cat => cat.category);
        }

        res.json(cases);
    } catch (err) {
        console.error('Get cases error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const caseItem = await getOne(`
            SELECT c.*, e.company_name as enterprise_name, e.region as enterprise_region, e.id as enterprise_id
            FROM cases c
            JOIN enterprise_profiles e ON c.enterprise_id = e.id
            WHERE c.id = ?
        `, [id]);

        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        const categories = await getAll('SELECT category FROM case_category_links WHERE case_id = ?', [id]);
        caseItem.categories = categories.map(cat => cat.category);

        const files = await getAll('SELECT * FROM case_files WHERE case_id = ?', [id]);
        caseItem.files = files;

        res.json(caseItem);
    } catch (err) {
        console.error('Get case error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;