import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

const signupSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
    password: z.string().min(8).max(128)
});

router.post('/signup', async (req, res) => {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.flatten() });
    }
    const { name, email, password } = parseResult.data;

    try {
        const pool = getPool();

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const passwordHash = await hashPassword(password);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash]
        );

        const userId = result.insertId;
        const token = signToken({ userId, email });
        return res.status(201).json({
            user: { id: userId, name, email },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128)
});

router.post('/login', async (req, res) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parseResult.error.flatten() });
    }
    const { email, password } = parseResult.data;

    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1', [email]);
        const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await verifyPassword(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken({ userId: user.id, email: user.email });
        return res.json({
            user: { id: user.id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1', [req.user.userId]);
        const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ user });
    } catch (error) {
        console.error('Me error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;


