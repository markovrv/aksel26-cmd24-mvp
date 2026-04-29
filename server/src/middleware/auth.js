import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'factory-gto-secret-key-2026';

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Недействительный токен' });
    }
}

export function roleMiddleware(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Доступ запрещён' });
        }
        next();
    };
}

export { JWT_SECRET };