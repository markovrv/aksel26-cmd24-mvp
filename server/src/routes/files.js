import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runQuery, getOne, getAll } from '../database/connection.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла'));
        }
    }
});

const router = express.Router();

// Helper to check if case deadline hasn't passed
async function canModifyCase(caseId) {
    const caseItem = await getOne('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!caseItem) return { can: false, error: 'Кейс не найден' };
    if (new Date(caseItem.deadline) < new Date()) return { can: false, error: 'Дедлайн кейса истёк' };
    return { can: true, caseItem };
}

// Upload case files (enterprise owner only)
router.post('/case-files/:caseId', authMiddleware, roleMiddleware('enterprise'), upload.array('files', 10), async (req, res) => {
    try {
        const { caseId } = req.params;
        const enterpriseProfile = await getOne('SELECT id FROM enterprise_profiles WHERE user_id = ?', [req.user.id]);
        if (!enterpriseProfile) {
            return res.status(404).json({ error: 'Профиль предприятия не найден' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ? AND enterprise_id = ?', [caseId, enterpriseProfile.id]);
        if (!caseItem) {
            return res.status(404).json({ error: 'Кейс не найден' });
        }

        const deadlineCheck = await canModifyCase(caseId);
        if (!deadlineCheck.can) {
            return res.status(400).json({ error: deadlineCheck.error });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Файлы не предоставлены' });
        }

        const uploadedFiles = [];
        for (const file of req.files) {
            const result = await runQuery(`
                INSERT INTO case_files (case_id, original_name, stored_name, file_path, mime_type, file_size, uploader_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [caseId, file.originalname, file.filename, file.path, file.mimetype, file.size, req.user.id]);
            uploadedFiles.push({ id: result.lastID, original_name: file.originalname });
        }

        res.status(201).json({ message: 'Файлы загружены', files: uploadedFiles });
    } catch (err) {
        console.error('Upload case files error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Upload submission files (participant owner only)
router.post('/submission-files/:submissionId', authMiddleware, roleMiddleware('participant'), upload.array('files', 10), async (req, res) => {
    try {
        const { submissionId } = req.params;
        const participantProfile = await getOne('SELECT id FROM participant_profiles WHERE user_id = ?', [req.user.id]);
        if (!participantProfile) {
            return res.status(404).json({ error: 'Профиль участника не найден' });
        }

        const submission = await getOne('SELECT * FROM submissions WHERE id = ? AND participant_id = ?', [submissionId, participantProfile.id]);
        if (!submission) {
            return res.status(404).json({ error: 'Решение не найдено' });
        }

        const caseItem = await getOne('SELECT * FROM cases WHERE id = ?', [submission.case_id]);
        if (new Date(caseItem.deadline) < new Date()) {
            return res.status(400).json({ error: 'Дедлайн кейса истёк' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Файлы не предоставлены' });
        }

        const uploadedFiles = [];
        for (const file of req.files) {
            const result = await runQuery(`
                INSERT INTO submission_files (submission_id, original_name, stored_name, file_path, mime_type, file_size, uploader_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [submissionId, file.originalname, file.filename, file.path, file.mimetype, file.size, req.user.id]);
            uploadedFiles.push({ id: result.lastID, original_name: file.originalname });
        }

        res.status(201).json({ message: 'Файлы загружены', files: uploadedFiles });
    } catch (err) {
        console.error('Upload submission files error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Get case files
router.get('/case-files/:caseId', authMiddleware, async (req, res) => {
    try {
        const { caseId } = req.params;
        const files = await getOne('SELECT id, original_name, mime_type, file_size, uploaded_at FROM case_files WHERE case_id = ?', [caseId]);
        const allFiles = await getAll('SELECT id, original_name, mime_type, file_size, uploaded_at FROM case_files WHERE case_id = ?', [caseId]);
        res.json(allFiles);
    } catch (err) {
        console.error('Get case files error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Get submission files
router.get('/submission-files/:submissionId', authMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const allFiles = await getAll('SELECT id, original_name, mime_type, file_size, uploaded_at FROM submission_files WHERE submission_id = ?', [submissionId]);
        res.json(allFiles);
    } catch (err) {
        console.error('Get submission files error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Delete file
router.delete('/:fileId', authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const { type } = req.query; // 'case' or 'submission'

        let file, table, ownerField, entityIdField;
        if (type === 'case') {
            table = 'case_files';
            ownerField = 'uploader_id';
            file = await getOne(`SELECT cf.*, c.enterprise_id, ep.user_id as enterprise_user_id
                FROM case_files cf
                JOIN cases c ON cf.case_id = c.id
                JOIN enterprise_profiles ep ON c.enterprise_id = ep.id
                WHERE cf.id = ?`, [fileId]);
        } else if (type === 'submission') {
            table = 'submission_files';
            file = await getOne(`SELECT sf.*, s.participant_id, pp.user_id as participant_user_id
                FROM submission_files sf
                JOIN submissions s ON sf.submission_id = s.id
                JOIN participant_profiles pp ON s.participant_id = pp.id
                WHERE sf.id = ?`, [fileId]);
        } else {
            return res.status(400).json({ error: 'Не указан тип файла' });
        }

        if (!file) {
            return res.status(404).json({ error: 'Файл не найден' });
        }

        // Check permissions
        const isAdmin = req.user.role === 'admin';
        const isOwner = file.uploader_id === req.user.id;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Нет прав на удаление файла' });
        }

        // Check deadline for case files
        if (type === 'case') {
            const caseItem = await getOne('SELECT deadline FROM cases WHERE id = ?', [file.case_id]);
            if (caseItem && new Date(caseItem.deadline) < new Date()) {
                return res.status(400).json({ error: 'Нельзя удалять файлы после дедлайна' });
            }
        } else if (type === 'submission') {
            const caseItem = await getOne('SELECT deadline FROM cases WHERE id = (SELECT case_id FROM submissions WHERE id = ?)', [file.submission_id]);
            if (caseItem && new Date(caseItem.deadline) < new Date()) {
                return res.status(400).json({ error: 'Нельзя удалять файлы после дедлайна' });
            }
        }

        // Delete physical file
        if (fs.existsSync(file.file_path)) {
            fs.unlinkSync(file.file_path);
        }

        // Delete from database
        await runQuery(`DELETE FROM ${table} WHERE id = ?`, [fileId]);

        res.json({ message: 'Файл удалён' });
    } catch (err) {
        console.error('Delete file error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Download file
router.get('/:fileId/download', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { type } = req.query;

        let file, table;
        if (type === 'case') {
            table = 'case_files';
        } else if (type === 'submission') {
            table = 'submission_files';
        } else {
            return res.status(400).json({ error: 'Не указан тип файла' });
        }

        file = await getOne(`SELECT * FROM ${table} WHERE id = ?`, [fileId]);

        if (!file) {
            return res.status(404).json({ error: 'Файл не найден' });
        }

        if (!fs.existsSync(file.file_path)) {
            return res.status(404).json({ error: 'Файл не найден на сервере' });
        }

        res.download(file.file_path, file.original_name);
    } catch (err) {
        console.error('Download file error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;