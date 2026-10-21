# 2. Skema Tunggal Terpadu untuk Migrasi Berkas Multi-Sheet Excel

Data kearsipan dari sheet tematik (`DAFTAR ARSIP INAKTIF (RUBRIK)`), sheet kronologis (`DAFTAR ARSIP INAKTIF_UMUM`), dan sheet arsip aktif (`DAFTAR ARSIP BU KARO`) digabungkan ke dalam satu tabel basis data relasional tunggal dengan atribut diskriminator `jenis_arsip` (`AKTIF` atau `INAKTIF`) serta `rubrik` kearsipan. Keputusan ini diambil agar pencarian publik dan temu balik arsip dapat dilakukan secara instan melalui satu pintu pencarian terpadu tanpa mengharuskan pengguna memfilter atau berpindah-pindah sumber data.
