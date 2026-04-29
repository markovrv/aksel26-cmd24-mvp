import express from 'express';
import { body, validationResult } from 'express-validator';
import { runQuery, getOne, getAll } from '../database/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;

        let sql = 'SELECT id, email, role, status, created_at FROM users WHERE 1=1';
        const params = [];

        if (role) {
            sql += ' AND role = ?';
            params.push(role);
        }
        if (search) {
            sql += ' AND email LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY created_at DESC';

        const users = await getAll(sql, params);
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/enterprises', async (req, res) => {
    try {
        const { status } = req.query;

        let sql = `
            SELECT ep.*, u.email, u.status as user_status
            FROM enterprise_profiles ep
            JOIN users u ON ep.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ' AND ep.moderation_status = ?';
            params.push(status);
        }

        sql += ' ORDER BY ep.created_at DESC';

        const enterprises = await getAll(sql, params);
        res.json(enterprises);
    } catch (err) {
        console.error('Get enterprises error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.patch('/enterprises/:id/moderate', [
    body('status').isIn(['approved', 'rejected'])
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await runQuery('UPDATE enterprise_profiles SET moderation_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

        await runQuery(`
            INSERT INTO admin_logs (admin_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, 'moderate_enterprise', 'enterprise_profiles', id, JSON.stringify({ status })]);

        const enterprise = await getOne('SELECT * FROM enterprise_profiles WHERE id = ?', [id]);
        res.json(enterprise);
    } catch (err) {
        console.error('Moderate enterprise error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/cases', async (req, res) => {
    try {
        const { status } = req.query;

        let sql = `
            SELECT c.*, ep.company_name as enterprise_name
            FROM cases c
            JOIN enterprise_profiles ep ON c.enterprise_id = ep.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ' AND c.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY c.created_at DESC';

        const cases = await getAll(sql, params);
        res.json(cases);
    } catch (err) {
        console.error('Get cases error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.patch('/cases/:id/status', [
    body('status').isIn(['open', 'closed'])
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await runQuery('UPDATE cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

        await runQuery(`
            INSERT INTO admin_logs (admin_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, 'change_case_status', 'cases', id, JSON.stringify({ status })]);

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ?', [id]);
        res.json(caseItem);
    } catch (err) {
        console.error('Change case status error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/news', [
    body('title').notEmpty(),
    body('summary').optional(),
    body('content').optional(),
    body('imageUrl').optional(),
    body('publishedAt').optional().isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, summary, content, imageUrl, publishedAt } = req.body;

        const result = await runQuery(`
            INSERT INTO news (title, summary, content, image_url, published_at)
            VALUES (?, ?, ?, ?, ?)
        `, [title, summary || '', content || '', imageUrl || '', publishedAt || new Date()]);

        const newsItem = await getOne('SELECT * FROM news WHERE id = ?', [result.lastID]);
        res.status(201).json(newsItem);
    } catch (err) {
        console.error('Create news error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.put('/news/:id', [
    body('title').optional().notEmpty(),
    body('summary').optional(),
    body('content').optional(),
    body('imageUrl').optional(),
    body('publishedAt').optional().isISO8601()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { title, summary, content, imageUrl, publishedAt } = req.body;

        await runQuery(`
            UPDATE news
            SET title = COALESCE(?, title),
                summary = COALESCE(?, summary),
                content = COALESCE(?, content),
                image_url = COALESCE(?, image_url),
                published_at = COALESCE(?, published_at),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [title, summary, content, imageUrl, publishedAt, id]);

        const newsItem = await getOne('SELECT * FROM news WHERE id = ?', [id]);
        res.json(newsItem);
    } catch (err) {
        console.error('Update news error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.delete('/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runQuery('DELETE FROM news WHERE id = ?', [id]);

        await runQuery(`
            INSERT INTO admin_logs (admin_user_id, action, entity_type, entity_id)
            VALUES (?, ?, ?, ?)
        `, [req.user.id, 'delete_news', 'news', id]);

        res.json({ message: 'Новость удалена' });
    } catch (err) {
        console.error('Delete news error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await getOne('SELECT COUNT(*) as count FROM users');
        const totalParticipants = await getOne('SELECT COUNT(*) as count FROM users WHERE role = ?', ['participant']);
        const totalEnterprises = await getOne('SELECT COUNT(*) as count FROM enterprise_profiles');
        const totalCases = await getOne('SELECT COUNT(*) as count FROM cases');
        const totalSubmissions = await getOne('SELECT COUNT(*) as count FROM submissions');

        res.json({
            totalUsers: totalUsers?.count || 0,
            totalParticipants: totalParticipants?.count || 0,
            totalEnterprises: totalEnterprises?.count || 0,
            totalCases: totalCases?.count || 0,
            totalSubmissions: totalSubmissions?.count || 0
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;