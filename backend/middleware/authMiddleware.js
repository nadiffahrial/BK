import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

// Memeriksa token JWT
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token autentikasi tidak ditemukan.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Periksa kembali akun di database
        const db = getDb();

        const [users] = await db.query(
            `SELECT id, name, email, role, department, avatar_url
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [decoded.sub]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Akun tidak ditemukan.'
            });
        }

        const user = users[0];

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            avatarUrl: user.avatar_url
        };

        next();

    } catch (error) {
        if (
            error.name === 'TokenExpiredError' ||
            error.name === 'JsonWebTokenError'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau sudah kedaluwarsa.'
            });
        }

        console.error('Authentication error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan autentikasi.'
        });
    }
};

// Memeriksa hak akses berdasarkan role
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Kamu tidak memiliki izin untuk mengakses fitur ini.'
            });
        }

        next();
    };
};