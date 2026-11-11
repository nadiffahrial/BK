import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartspace_db',
    port: Number(process.env.DB_PORT) || 3306
};

const isBcryptHash = (password) => {
    return /^\$2[aby]\$\d{2}\$/.test(password);
};

const migratePasswords = async () => {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        console.log('Berhasil terhubung ke database.');

        const [users] = await connection.query(
            'SELECT id, email, password FROM users'
        );

        const usersToMigrate = users.filter(user => {
            return user.password &&
                !isBcryptHash(user.password);
        });

        console.log(`Total akun: ${users.length}`);
        console.log(`Password yang perlu di-hash: ${usersToMigrate.length}`);

        if (usersToMigrate.length === 0) {
            console.log('Tidak ada password yang perlu dimigrasikan.');
            return;
        }

        if (!process.argv.includes('--apply')) {
            console.log('\nMODE PEMERIKSAAN');
            console.log('Belum ada perubahan database.');
            console.log('Jalankan dengan --apply untuk melakukan migrasi.');
            return;
        }

        await connection.beginTransaction();

        for (const user of usersToMigrate) {
            const hashedPassword = await bcrypt.hash(user.password, 12);

            await connection.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, user.id]
            );

            console.log(`Password berhasil di-hash: ${user.email}`);
        }

        await connection.commit();

        console.log('\nMigrasi password berhasil!');
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error('Migrasi gagal:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

migratePasswords();