# Bootstrap Super Admin

Super Admin pertama dibuat satu kali dari backend. Jalankan ini setelah database aktif dan backend dependencies sudah terpasang:

```powershell
$env:SUPER_ADMIN_NAME = 'Nama Pengelola'
$env:SUPER_ADMIN_EMAIL = 'superadmin@kampus.ac.id'
$env:SUPER_ADMIN_PASSWORD = 'Gunakan-kata-sandi-kuat-12-karakter'
npm run bootstrap:super-admin
Remove-Item Env:\SUPER_ADMIN_NAME, Env:\SUPER_ADMIN_EMAIL, Env:\SUPER_ADMIN_PASSWORD
```

Jika email tersebut sudah menjadi Admin, bootstrap akan menaikkan akun itu menjadi Super Admin dan mengganti kata sandinya. Jika belum, akun Super Admin baru akan dibuat. Bootstrap berhenti jika Super Admin sudah ada.

Setelah masuk, menu **Kelola Admin** tersedia di sidebar Super Admin. Dari sana akun Admin dapat dibuat, dilihat waktu login terakhirnya, kata sandinya direset, dan akunnya dihapus. Reset dan penghapusan dicatat pada log aktivitas.
