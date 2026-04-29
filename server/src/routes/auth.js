import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { runQuery, getOne, getAll } from '../database/connection.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => value === req.body.password),
    body('role').isIn(['participant', 'enterprise']),
    body('consentPersonalData').equals('true'),
    body('companyName').if(body('role').equals('enterprise')).notEmpty(),
    body('fullName').if(body('role').equals('participant')).notEmpty(),
    body('category').if(body('role').equals('participant')).isIn(['school_8_9', 'school_10_11', 'spo', 'university'])
];

router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role, fullName, educationOrg, category, region, contactConsent,
                companyName, companyRegion, description, contactPerson } = req.body;

        const existing = await getOne('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await runQuery(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, passwordHash, role]
        );

        const userId = result.lastID;

        if (role === 'participant') {
            await runQuery(
                'INSERT INTO participant_profiles (user_id, full_name, education_org, category, region, contact_consent) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, fullName, educationOrg || '', category, region || '', contactConsent ? 1 : 0]
            );
        } else if (role === 'enterprise') {
            await runQuery(
                'INSERT INTO enterprise_profiles (user_id, company_name, region, description, contact_person, moderation_status) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, companyName, companyRegion || '', description || '', contactPerson || '', 'pending']
            );
        }

        await runQuery('INSERT INTO consents (user_id, consent_type, is_given) VALUES (?, ?, ?)',
            [userId, 'personal_data', 1]);

        const token = generateToken({ id: userId, email, role });

        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: { id: userId, email, role }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await getOne('SELECT id, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        let profile = null;
        if (user.role === 'participant') {
            profile = await getOne('SELECT * FROM participant_profiles WHERE user_id = ?', [user.id]);
        } else if (user.role === 'enterprise') {
            profile = await getOne('SELECT * FROM enterprise_profiles WHERE user_id = ?', [user.id]);
        }

        res.json({ user, profile });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default router;