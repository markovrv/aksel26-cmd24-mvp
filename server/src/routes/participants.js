import express from 'express';
import { body, validationResult } from 'express-validator';
import { runQuery, getOne, getAll } from '../database/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('participant'));

router.get('/profile', async (req, res) => {
    try {
        const profile = await getOne('SELECT * FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }
        res.json(profile);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.put('/profile', [
    body('fullName').optional().notEmpty(),
    body('educationOrg').optional(),
    body('category').optional().isIn(['school_8_9', 'school_10_11', 'spo', 'university']),
    body('region').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, educationOrg, category, region, contactConsent } = req.body;

        await runQuery(`
            UPDATE participant_profiles
            SET full_name = COALESCE(?, full_name),
                education_org = COALESCE(?, education_org),
                category = COALESCE(?, category),
                region = COALESCE(?, region),
                contact_consent = COALESCE(?, contact_consent),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `, [fullName, educationOrg, category, region, contactConsent !== undefined ? (contactConsent ? 1 : 0) : null, req.user.id]);

        const profile = await getOne('SELECT * FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        res.json(profile);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/submissions', async (req, res) => {
    try {
        const profile = await getOne('SELECT id FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const submissions = await getAll(`
            SELECT s.*, c.title as case_title, c.deadline as case_deadline,
                   e.total_score, e.comment as evaluation_comment
            FROM submissions s
            JOIN cases c ON s.case_id = c.id
            LEFT JOIN evaluations e ON s.id = e.submission_id
            WHERE s.participant_id = ?
            ORDER BY s.submitted_at DESC
        `, [profile.id]);

        res.json(submissions);
    } catch (err) {
        console.error('Get submissions error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

import multer from 'multer';
const upload = multer();

router.post('/submissions',
    upload.none(),
    [
        body('caseId').isNumeric().toInt(),
        body('textAnswer').optional(),
        body('consent').equals('true')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log(req.body)

        const { caseId, textAnswer } = req.body;

        if (!textAnswer) {
            return res.status(400).json({ error: 'Необходимо указать текст решения или загрузить файл' });
        }

        const profile = await getOne('SELECT id FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ?', [caseId]);
        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        if (caseItem.status !== 'open' || new Date(caseItem.deadline) < new Date()) {
            return res.status(400).json({ error: 'Приём решений завершён' });
        }

        const existing = await getOne('SELECT id FROM submissions WHERE case_id = ? AND participant_id = ?',
            [caseId, profile.id]);
        if (existing) {
            return res.status(400).json({ error: 'Вы уже отправили решение для этого кейса' });
        }

        const result = await runQuery(
            'INSERT INTO submissions (case_id, participant_id, text_answer, status) VALUES (?, ?, ?, ?)',
            [caseId, profile.id, textAnswer, 'submitted']
        );

        const submission = await getOne('SELECT * FROM submissions WHERE id = ?', [result.lastID]);
        res.status(201).json(submission);
    } catch (err) {
        console.error('Create submission error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.put('/submissions/:id', [
    body('textAnswer').optional()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { textAnswer } = req.body;

        const profile = await getOne('SELECT id FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const submission = await getOne('SELECT * FROM submissions WHERE id = ? AND participant_id = ?',
            [id, profile.id]);
        if (!submission) {
            return res.status(404).json({ error: 'Решение не найдено' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ?', [submission.case_id]);
        if (caseItem.status !== 'open' || new Date(caseItem.deadline) < new Date()) {
            return res.status(400).json({ error: 'Редактирование решения недоступно' });
        }

        await runQuery(
            'UPDATE submissions SET text_answer = COALESCE(?, text_answer), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [textAnswer, id]
        );

        const updated = await getOne('SELECT * FROM submissions WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        console.error('Update submission error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;