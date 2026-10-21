# Pengelolaan Arsip Biro PBMN

Sistem pengelolaan dan temu balik arsip inaktif dan aktif di lingkungan Biro Pengelolaan Barang Milik Negara (PBMN) Kementerian PUPR berdasarkan Permen PUPR No. 26 Tahun 2021 tentang Jadwal Retensi Arsip.

## Language

### Struktur & Fisik Arsip

**Berkas**:
Kesatuan fisik dan informasi yang menghimpun satu atau lebih naskah arsip dalam satu kesatuan urusan atau masalah (nomor berkas).
_Avoid_: File, folder, dokumen tunggal

**Naskah / Item**:
Satuan informasi terkecil (surat, nota dinas, invoice, keputusan) di dalam satu berkas arsip (nomor urut).
_Avoid_: Lembar, sub-file

**Boks Arsip**:
Wadah fisik penyimpanan sekumpulan berkas arsip terstandar kearsipan yang disimpan pada rak/ruang record center.
_Avoid_: Kardus, kotak

**Lokasi Simpan**:
Keterangan fisik tempat penyimpanan boks arsip yang mencakup gedung, lantai, ruangan, dan nomor rak.
_Avoid_: Alamat, path

### Klasifikasi & Keamanan

**SKKAAD**:
Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis yang menentukan derajat keterbukaan akses arsip (Terbuka, Terbatas, Rahasia).
_Avoid_: Security level, izin akses

**Kode Klasifikasi**:
Kode alfanumerik klasifikasi urusan/masalah kearsipan Kementerian PUPR (misal: PS 0501, HK 0102).
_Avoid_: Kategori, tag

### Jadwal Retensi & Penyusutan (Permen PUPR 26/2021)

**JRA (Jadwal Retensi Arsip)**:
Daftar resmi penentuan jangka waktu penyimpanan arsip aktif dan inaktif serta penentuan nasib akhir arsip berdasarkan Permen PUPR Nomor 26 Tahun 2021.
_Avoid_: Masa kedaluwarsa, masa simpan, expiry

**Masa Retensi Aktif**:
Jangka waktu penyimpanan arsip pada unit pengolah sejak selesai diproses (umumnya 1–2 tahun).
_Avoid_: Masa pakai, masa hidup

**Masa Retensi Inaktif**:
Jangka waktu penyimpanan arsip pada record center/unit kearsipan setelah frekuensi penggunaannya menurun (berkisar 3–10 tahun).
_Avoid_: Masa gudang, masa simpan lama

**Pemusnahan Arsip**:
Kegiatan memusnahkan fisik arsip yang telah habis retensinya dan tidak bernilai guna berdasarkan rekomendasi Tim Penilai Arsip dan Berita Acara Pemusnahan.
_Avoid_: Hapus berkas, delete

**Berita Acara Pemusnahan**:
Dokumen otentik yang memuat pernyataan resmi pelaksanaan pemusnahan arsip beserta lampiran daftar berkas yang dimusnahkan.
_Avoid_: Surat keterangan hapus, log pemusnahan

**Penyerahan Arsip (Permanen)**:
Kegiatan menyerahkan arsip bernilai guna permanen/statis (kebijakan BMN, sengketa aset, BAST alih status) ke Unit Kearsipan Kementerian atau ANRI.
_Avoid_: Backup abadi, arsip tetap
