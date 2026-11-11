import { getDb } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validasi input
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi.'
            });
        }

        // 2. Pastikan JWT_SECRET tersedia
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET belum dikonfigurasi.');

            return res.status(500).json({
                success: false,
                message: 'Konfigurasi autentikasi server bermasalah.'
            });
        }

        // 3. Ambil data pengguna dari database
        const db = getDb();

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        const user = users[0];

        // 4. Verifikasi password menggunakan bcrypt
        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah.'
            });
        }

        // 5. Batasi akses hanya untuk Admin dan Super Admin
        const allowedRoles = ['admin', 'super_admin'];

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Akun tidak memiliki akses administrator.'
            });
        }

        // 6. Buat JWT asli
        const token = jwt.sign(
            {
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                subject: String(user.id),
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        // 7. Kirim respons login
        return res.status(200).json({
            success: true,
            message: 'Login berhasil.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatarUrl: user.avatar_url
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server.'
        });
    }
};