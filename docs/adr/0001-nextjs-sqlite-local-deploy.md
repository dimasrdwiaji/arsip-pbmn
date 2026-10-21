# 1. Next.js dan SQLite untuk Deployment Localhost Intranet Biro PBMN

Sistem arsip Biro PBMN dibangun sebagai aplikasi fullstack Next.js dengan basis data embedded SQLite (`better-sqlite3`), bukan arsitektur terpisah dengan DBMS server mandiri (seperti PostgreSQL atau MySQL). Keputusan ini diambil agar sistem dapat di-deploy secara portabel di lingkungan server lokal/Windows tanpa membutuhkan instalasi database daemon terpisah, mudah dibackup (cukup menyalin satu file `arsip.db`), serta memiliki skrip `start-arsip.bat` yang dapat dijalankan secara instan oleh staf kantor.
