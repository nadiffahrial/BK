export const recordAdminLogin = async (db, userId, ipAddress) => {
  try {
    await db.query(
      'INSERT INTO admin_activity_logs (actor_id, target_user_id, action, details, ip_address) VALUES (?, ?, \'login\', ?, ?)',
      [userId, userId, 'Admin berhasil masuk', ipAddress || null]
    );
  } catch (error) {
    console.error('Gagal mencatat login admin:', error.message);
  }
};
