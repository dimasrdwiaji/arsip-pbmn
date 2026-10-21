# 4. Inisialisasi Otomatis Data Excel dan Peran Bawaan Lokal

Aplikasi secara otomatis membaca dan mengimpor seluruh berkas `DAFTAR ARSIP INAKTIF_PMH BMN.xlsx` ke dalam basis data SQLite pada saat startup pertama kali dijalankan, serta menginisialisasi dua akun bawaan (`admin` dan `petugas`). Selain itu, sistem menyediakan generator Berita Acara Pemusnahan berbasis web siap cetak (*print-friendly*) yang mengacu pada format lampiran Permen PUPR No. 26 Tahun 2021 untuk memfasilitasi usulan pemusnahan arsip inaktif yang telah melampaui masa retensi.
