import { verifyToken } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
        const payload = verifyToken(token);
        req.user = payload;
        return next();
    } catch (_err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}


