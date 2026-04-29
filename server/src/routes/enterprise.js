import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runQuery, getOne, getAll } from '../database/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.pptx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Только PDF, DOCX, PPTX файлы'));
        }
    }
});

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('enterprise'));

router.get('/profile', async (req, res) => {
    try {
        const profile = await getOne('SELECT * FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
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
    body('companyName').optional().notEmpty(),
    body('region').optional(),
    body('description').optional(),
    body('contactPerson').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { companyName, region, description, contactPerson } = req.body;

        await runQuery(`
            UPDATE enterprise_profiles
            SET company_name = COALESCE(?, company_name),
                region = COALESCE(?, region),
                description = COALESCE(?, description),
                contact_person = COALESCE(?, contact_person),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `, [companyName, region, description, contactPerson, req.user.id]);

        const profile = await getOne('SELECT * FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        res.json(profile);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/cases', async (req, res) => {
    try {
        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        let cases = await getAll(`
            SELECT c.*,
                   (SELECT COUNT(*) FROM submissions WHERE case_id = c.id) as submission_count,
                   (SELECT COUNT(*) FROM submissions s JOIN evaluations e ON s.id = e.submission_id WHERE s.case_id = c.id) as reviewed_count
            FROM cases c
            WHERE c.enterprise_id = ?
            ORDER BY c.created_at DESC
        `, [profile.id]);

        // Attach participant categories to each case
        const casesWithCategories = await Promise.all(cases.map(async (caseItem) => {
            const cats = await getAll('SELECT category FROM case_category_links WHERE case_id = ?', [caseItem.id]);
            // Extract just the category values into an array
            caseItem.categories = cats.map(c => c.category);
            return caseItem;
        }));

        res.json(casesWithCategories);
    } catch (err) {
        console.error('Get cases error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/cases', upload.array('files', 5), async (req, res) => {
    try {
        let { title, shortDescription, fullDescription, requirements, deadline, categories } = req.body;

        // Manual validation
        const errors = [];
        if (!title || title.trim() === '') {
            errors.push({ type: 'field', msg: 'Название обязательно', path: 'title', location: 'body' });
        }
        if (!deadline) {
            errors.push({ type: 'field', msg: 'Дедлайн обязателен', path: 'deadline', location: 'body' });
        } else {
            const deadlineDate = new Date(deadline);
            if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
                errors.push({ type: 'field', msg: 'Неверный формат даты дедлайна', path: 'deadline', location: 'body' });
            }
        }
        if (categories && !Array.isArray(categories)) categories = [categories]
        if (!categories || (Array.isArray(categories) ? categories.length === 0 : !categories)) {
            errors.push({ type: 'field', msg: 'Выберите хотя бы одну категорию', path: 'categories', location: 'body' });
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const profile = await getOne('SELECT id, moderation_status FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }
        if (profile.moderation_status !== 'approved') {
            return res.status(403).json({ error: 'Профиль не прошёл модерацию' });
        }

        if (new Date(deadline) < new Date()) {
            return res.status(400).json({ error: 'Дедлайн не может быть в прошлом' });
        }

        const result = await runQuery(`
            INSERT INTO cases (enterprise_id, title, short_description, full_description, requirements, deadline, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [profile.id, title, shortDescription || '', fullDescription || '', requirements || '', deadline, 'open']);

        const caseId = result.lastID;

        for (const cat of categories) {
            await runQuery('INSERT INTO case_category_links (case_id, category) VALUES (?, ?)', [caseId, cat]);
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await runQuery(`
                    INSERT INTO case_files (case_id, original_name, stored_name, file_path, mime_type, file_size)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [caseId, file.originalname, file.filename, file.path, file.mimetype, file.size]);
            }
        }

        const created = await getOne('SELECT * FROM cases WHERE id = ?', [caseId]);
        res.status(201).json(created);
    } catch (err) {
        console.error('Create case error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.put('/cases/:id', [
    body('title').optional().notEmpty(),
    body('shortDescription').optional(),
    body('fullDescription').optional(),
    body('requirements').optional(),
    body('deadline').optional().isISO8601(),
    body('status').optional().isIn(['open', 'closed'])
], upload.array('files', 5), async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ? AND enterprise_id = ?', [id, profile.id]);
        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        if (new Date(caseItem.deadline) < new Date()) {
            return res.status(400).json({ error: 'Нельзя редактировать кейс после дедлайна' });
        }

        const { title, shortDescription, fullDescription, requirements, deadline, status } = req.body;

        await runQuery(`
            UPDATE cases
            SET title = COALESCE(?, title),
                short_description = COALESCE(?, short_description),
                full_description = COALESCE(?, full_description),
                requirements = COALESCE(?, requirements),
                deadline = COALESCE(?, deadline),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [title, shortDescription, fullDescription, requirements, deadline, status, id]);

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await runQuery(`
                    INSERT INTO case_files (case_id, original_name, stored_name, file_path, mime_type, file_size)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [id, file.originalname, file.filename, file.path, file.mimetype, file.size]);
            }
        }

        const updated = await getOne('SELECT * FROM cases WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        console.error('Update case error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Delete case
router.delete('/cases/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ? AND enterprise_id = ?', [id, profile.id]);
        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        // Delete associated files and category links first
        await runQuery('DELETE FROM case_files WHERE case_id = ?', [id]);
        await runQuery('DELETE FROM case_category_links WHERE case_id = ?', [id]);
        // Then delete the case itself
        await runQuery('DELETE FROM cases WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Delete case error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/cases/:id/submissions', async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ? AND enterprise_id = ?', [id, profile.id]);
        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        const submissions = await getAll(`
            SELECT s.*, pp.full_name, pp.education_org, pp.category, pp.region, pp.contact_consent,
                   e.total_score, e.comment as evaluation_comment
            FROM submissions s
            JOIN participant_profiles pp ON s.participant_id = pp.id
            LEFT JOIN evaluations e ON s.id = e.submission_id
            WHERE s.case_id = ?
            ORDER BY s.submitted_at DESC
        `, [id]);

        res.json(submissions);
    } catch (err) {
        console.error('Get submissions error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/submissions/:id/evaluate', [
    body('elaboration').isInt({ min: 1, max: 5 }),
    body('applicability').isInt({ min: 1, max: 5 }),
    body('originality').isInt({ min: 1, max: 5 }),
    body('technicalLogic').isInt({ min: 1, max: 5 }),
    body('presentation').isInt({ min: 1, max: 5 }),
    body('comment').optional()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { elaboration, applicability, originality, technicalLogic, presentation, comment } = req.body;

        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const submission = await getOne(`
            SELECT s.*, c.enterprise_id
            FROM submissions s
            JOIN cases c ON s.case_id = c.id
            WHERE s.id = ?
        `, [id]);

        if (!submission || submission.enterprise_id !== profile.id) {
            return res.status(404).json({ error: 'Решение не найдено' });
        }

        const totalScore = elaboration + applicability + originality + technicalLogic + presentation;

        const existing = await getOne('SELECT id FROM evaluations WHERE submission_id = ?', [id]);

        let evaluationId;
        if (existing) {
            await runQuery(`
                UPDATE evaluations
                SET total_score = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
                WHERE submission_id = ?
            `, [totalScore, comment, id]);
            evaluationId = existing.id;

            await runQuery(`
                UPDATE evaluation_scores
                SET elaboration = ?, applicability = ?, originality = ?, technical_logic = ?, presentation = ?
                WHERE evaluation_id = ?
            `, [elaboration, applicability, originality, technicalLogic, presentation, evaluationId]);
        } else {
            const result = await runQuery(`
                INSERT INTO evaluations (submission_id, reviewer_enterprise_id, total_score, comment)
                VALUES (?, ?, ?, ?)
            `, [id, profile.id, totalScore, comment]);
            evaluationId = result.lastID;

            await runQuery(`
                INSERT INTO evaluation_scores (evaluation_id, elaboration, applicability, originality, technical_logic, presentation)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [evaluationId, elaboration, applicability, originality, technicalLogic, presentation]);
        }

        await runQuery('UPDATE submissions SET status = ? WHERE id = ?', ['reviewed', id]);

        const evaluation = await getOne('SELECT * FROM evaluations WHERE id = ?', [evaluationId]);
        res.json(evaluation);
    } catch (err) {
        console.error('Evaluate error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const profile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!profile) {
            return res.status(404).json({ error: 'Профиль не найден' });
        }

        const totalSubmissions = await getOne(`
            SELECT COUNT(*) as count FROM submissions s
            JOIN cases c ON s.case_id = c.id
            WHERE c.enterprise_id = ?
        `, [profile.id]);

        const regionStats = await getAll(`
            SELECT pp.region, COUNT(*) as count
            FROM submissions s
            JOIN cases c ON s.case_id = c.id
            JOIN participant_profiles pp ON s.participant_id = pp.id
            WHERE c.enterprise_id = ?
            GROUP BY pp.region
        `, [profile.id]);

        const categoryStats = await getAll(`
            SELECT pp.category, COUNT(*) as count
            FROM submissions s
            JOIN cases c ON s.case_id = c.id
            JOIN participant_profiles pp ON s.participant_id = pp.id
            WHERE c.enterprise_id = ?
            GROUP BY pp.category
        `, [profile.id]);

        res.json({
            totalSubmissions: totalSubmissions?.count || 0,
            regionStats,
            categoryStats
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;