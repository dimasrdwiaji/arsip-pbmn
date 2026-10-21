# Panduan Version Control ke GitHub: E-Arsip Biro PBMN

Dokumen ini merupakan panduan langkah demi langkah untuk mengelola kode program dan perubahan aplikasi **E-Arsip Biro PBMN** menggunakan **Git** dan **GitHub**.

---

## Prasyarat
1. Telah memiliki akun di [GitHub.com](https://github.com).
2. Git sudah terpasang di komputer ini (dapat dicek dengan mengetik `git --version` di PowerShell/Command Prompt).

---

## Langkah 1: Inisialisasi Git di Komputer Lokal

Buka terminal **PowerShell** di folder proyek (`c:\Users\Dimas RD\Documents\arsip-pbmn`), lalu jalankan:

```powershell
# 1. Inisialisasi repositori Git baru
git init

# 2. Atur nama branch utama menjadi 'main'
git branch -M main

# 3. Masukkan seluruh file proyek ke stage (file besar & cache diatur oleh .gitignore)
git add .

# 4. Buat commit pertama
git commit -m "feat: inisialisasi aplikasi E-Arsip Biro PBMN dengan Next.js, SQLite, dan JRA Permen PUPR 26/2021"
```

---

## Langkah 2: Membuat Repository Baru di GitHub

1. Buka peramban dan masuk ke akun GitHub Anda di **https://github.com**.
2. Klik tombol **"+"** di pojok kanan atas, lalu pilih **"New repository"**.
3. Isi kolom repository:
   - **Repository name**: `arsip-pbmn` (atau nama lain yang Anda kehendaki).
   - **Description**: `Sistem Informasi Pengelolaan & Jadwal Retensi Arsip Biro PBMN Kementerian PUPR`.
   - **Visibility**: Pilih **Private** (sangat disarankan untuk dokumen internal instansi) atau **Public**.
   - **PENTING**: **Jangan centang** opsi *"Add a README file"*, *"Add .gitignore"*, atau *"Choose a license"*, karena file-file tersebut sudah ada di folder komputer Anda.
4. Klik tombol **"Create repository"**.

---

## Langkah 3: Menghubungkan dan Mengunggah (Push) ke GitHub

Setelah repository dibuat di GitHub, salin URL repository Anda (misal: `https://github.com/username-anda/arsip-pbmn.git`), lalu jalankan perintah berikut di PowerShell:

```powershell
# Hubungkan folder lokal dengan repository GitHub
git remote add origin https://github.com/username-anda/arsip-pbmn.git

# Unggah seluruh kode ke branch main di GitHub
git push -u origin main
```

*(Jika diminta login atau memasukkan Personal Access Token GitHub, ikuti petunjuk otentikasi browser yang muncul).*

---

## Langkah 4: Alur Kerja Harian (Workflow Update)

Setiap kali Anda selesai melakukan perubahan fitur atau pembaruan kode:

```powershell
# 1. Cek status berkas yang berubah
git status

# 2. Tambahkan semua perubahan
git add .

# 3. Simpan perubahan dengan pesan deskriptif
git commit -m "update: perbaikan tata letak dan penambahan fitur baru"

# 4. Kirim pembaruan ke GitHub
git push
```

---

## Langkah 5: Mengunduh di Komputer Lain / Laptop Rekan Kerja

Jika aplikasi ingin dijalankan di komputer atau server lokal lain di kantor:

```powershell
# Clone repositori
git clone https://github.com/username-anda/arsip-pbmn.git

# Masuk ke folder
cd arsip-pbmn

# Pasang pustaka dependensi
npm install

# Jalankan aplikasi
npm run dev
```
Atau cukup klik ganda pada berkas `start-arsip.bat`.
