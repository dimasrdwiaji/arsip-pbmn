@echo off
title E-Arsip Biro PBMN Kementerian PUPR
color 0F
echo ================================================================
echo       SISTEM INFORMASI PENGELOLAAN ARSIP BIRO PBMN
echo            KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT
echo       (Berdasarkan Permen PUPR No. 26 Tahun 2021 tentang JRA)
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa basis data lokal...
if not exist "data\arsip.db" (
    echo Basis data belum ditemukan. Memulai impor otomatis dari spreadsheet...
    npx tsx scripts/test-import.ts
) else (
    echo Basis data data\arsip.db terdeteksi siap digunakan.
)

echo.
echo [2/3] Membuka browser ke http://localhost:3000...
start http://localhost:3000

echo.
echo [3/3] Menjalankan server aplikasi Next.js di localhost:3000...
echo Tekan CTRL+C jika ingin mematikan server.
echo.
npm run dev
