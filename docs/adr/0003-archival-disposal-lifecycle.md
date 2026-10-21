# 3. Siklus Hidup Penyusutan Arsip Berita Acara Tanpa Hard Delete

Arsip yang telah melampaui jangka waktu retensi menurut Permen PUPR No. 26 Tahun 2021 tidak dihapus secara permanen (*hard delete*) dari basis data. Sistem menerapkan transisi status administratif: `DALAM_RETENSI` → `REKOMENDASI_MUSNAH` → `USUL_MUSNAH` → `DIMUSNAHKAN`. Berkas yang dimusnahkan akan menghasilkan draft Berita Acara Pemusnahan resmi beserta daftar lampiran arsip, dan catatan metadata beserta log audit tetap disimpan sebagai bukti pertanggungjawaban yuridis kearsipan instansi pemerintah.
