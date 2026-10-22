/**
 * Mesin Translasi Kodefikasi & Penyelenggaraan Kearsipan
 *
 * Mengacu pada 4 Regulasi Resmi:
 * 1. Sebelum Oktober 2018:
 *    Permen PU No. 38 Tahun 2007 tentang Pedoman Pola Klasifikasi Arsip Departemen Pekerjaan Umum
 * 2. Setelah Oktober 2018:
 *    Permen PUPR No. 16/PRT/M/2018 Tahun 2018 tentang Klasifikasi Arsip Kementerian Pekerjaan Umum dan Perumahan Rakyat
 * 3. Klasifikasi Keamanan & Akses (SKKAAD):
 *    Permen PUPR No. 27 Tahun 2021 tentang Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis
 * 4. Penyelenggaraan Arsip Dinamis:
 *    Permen PU RI No. 15 Tahun 2026 tentang Penyelenggaraan Arsip Dinamis Kementerian Pekerjaan Umum
 */

export interface CodeTranslation {
  kode: string;
  kodeBersih: string;
  dasarHukum: string;
  periodeRegulasi: "PRE_OCT_2018" | "POST_OCT_2018";
  namaRegulasi: string;
  fungsi: string;
  pokokMasalah: string;
  subMasalah: string;
  rincian: string;
  skkaadInfo: {
    kategori: string;
    dasarHukum: string;
    hakAkses: string;
    keterangan: string;
  };
  penyelenggaraanInfo: {
    dasarHukum: string;
    tahapSiklus: string;
    unitPenanggungJawab: string;
    prosedurPengelolaan: string;
  };
}

interface CodeDictionaryEntry {
  fungsi: string;
  pokokMasalah: string;
  subMasalah: string;
  rincianPre2018?: string;
  rincianPost2018?: string;
  rincianDefault: string;
}

const CLASSIFICATION_DICTIONARY: Record<string, CodeDictionaryEntry> = {
  // Pengelolaan BMN (PS)
  "PS0101": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.01 Perencanaan & Penganggaran BMN",
    rincianPre2018: "PS.01.01 Rencana Kebutuhan Barang Milik Negara (RKBMN) Tahunan",
    rincianPost2018: "PS 01 01 Usulan & Penelaahan Rencana Kebutuhan BMN Kementerian PUPR",
    rincianDefault: "Perencanaan Kebutuhan Barang Milik Negara",
  },
  "PS0102": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.01 Standarisasi Sarana & Prasarana",
    rincianPre2018: "PS.01.02 Standarisasi Pengadaan Sarana & Prasarana Kantor Departemen PU",
    rincianPost2018: "PS 01 02 Standar Barang Standar Kebutuhan (SBSK) Sarana Perkantoran",
    rincianDefault: "Standarisasi Sarana dan Prasarana BMN",
  },
  "PS0201": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.02 Penggunaan BMN",
    rincianPre2018: "PS.02.01 Penetapan Status Penggunaan (PSP) Tanah & Bangunan Gedung",
    rincianPost2018: "PS 02 01 Keputusan Penetapan Status Penggunaan (PSP) Aset Kementerian PUPR",
    rincianDefault: "Penetapan Status Penggunaan BMN",
  },
  "PS0202": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.02 Pengalihan Status Penggunaan BMN",
    rincianPre2018: "PS.02.02 Pengalihan Status Penggunaan BMN Antar Unit Kerja / Eselon I",
    rincianPost2018: "PS 02 02 Alih Status Penggunaan Aset Gedung, Tanah, & Rumah Negara",
    rincianDefault: "Pengalihan Status Penggunaan Barang Milik Negara",
  },
  "PS0301": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.03 Pemanfaatan BMN",
    rincianPre2018: "PS.03.01 Sewa BMN Lahan dan Bangunan Kantor kepada Pihak Ketiga",
    rincianPost2018: "PS 03 01 Pemanfaatan BMN Berupa Sewa Aset & Penetapan Besaran Tarif Sewa",
    rincianDefault: "Pemanfaatan BMN - Sewa Aset",
  },
  "PS0302": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.03 Pemanfaatan BMN",
    rincianPre2018: "PS.03.02 Pinjam Pakai BMN kepada Pemerintah Daerah / Instansi Lain",
    rincianPost2018: "PS 03 02 Perjanjian & Pelaksanaan Pinjam Pakai BMN",
    rincianDefault: "Pemanfaatan BMN - Pinjam Pakai",
  },
  "PS0303": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.03 Kerjasama Pemanfaatan (KSP)",
    rincianPre2018: "PS.03.03 Kerjasama Pemanfaatan Lahan Departemen PU",
    rincianPost2018: "PS 03 03 Pelaksanaan & Monitoring Kerjasama Pemanfaatan (KSP) BMN",
    rincianDefault: "Pemanfaatan BMN - Kerjasama Pemanfaatan (KSP)",
  },
  "PS0304": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.03 Bangun Guna Serah / Bangun Serah Guna",
    rincianDefault: "Pemanfaatan BMN Berupa Bangun Guna Serah (BGS) / Bangun Serah Guna (BSG)",
  },
  "PS0401": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.04 Pemindahtanganan BMN",
    rincianPre2018: "PS.04.01 Penjualan BMN Secara Lelang Umum / Rumah Negara Golongan III",
    rincianPost2018: "PS 04 01 Pemindahtanganan Melalui Penjualan Lelang BMN & Kendaraan Dinas",
    rincianDefault: "Pemindahtanganan BMN Berupa Penjualan",
  },
  "PS0402": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.04 Pemindahtanganan BMN",
    rincianPre2018: "PS.04.02 Tukar Menukar BMN (Ruislag) Lahan dan Prasarana PU",
    rincianPost2018: "PS 04 02 Persetujuan & Perjanjian Tukar Menukar Tanah / Bangunan BMN",
    rincianDefault: "Pemindahtanganan BMN Berupa Tukar Menukar (Ruislag)",
  },
  "PS0403": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.04 Pemindahtanganan BMN",
    rincianPre2018: "PS.04.03 Hibah Barang Milik Negara kepada Instansi / Lembaga / Pemda",
    rincianPost2018: "PS 04 03 Pemindahtanganan Berupa Hibah Aset Negara (Infrastruktur/Tanah)",
    rincianDefault: "Pemindahtanganan BMN Berupa Hibah Aset Negara",
  },
  "PS0404": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.04 Pemindahtanganan BMN",
    rincianPre2018: "PS.04.04 Penyertaan Modal Pemerintah (PMP) pada BUMN",
    rincianPost2018: "PS 04 04 Penyertaan Modal Pemerintah Pusat (PMP) Infrastruktur kepada BUMN",
    rincianDefault: "Penyertaan Modal Pemerintah Pusat (PMP)",
  },
  "PS0501": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.05 Pemusnahan & Penghapusan BMN",
    rincianPre2018: "PS.05.01 Pemusnahan BMN / Fisik Arsip yang Tidak Memiliki Nilai Guna",
    rincianPost2018: "PS 05 01 Tata Cara Pelaksanaan & Berita Acara Pemusnahan BMN",
    rincianDefault: "Pemusnahan Barang Milik Negara",
  },
  "PS0502": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.05 Penghapusan BMN",
    rincianPre2018: "PS.05.02 Surat Keputusan Penghapusan BMN dari Buku Inventaris",
    rincianPost2018: "PS 05 02 Keputusan Penghapusan BMN Berdasarkan Sebab Normal / Sebab Khusus",
    rincianDefault: "Penghapusan Barang Milik Negara dari Daftar Barang Pengguna",
  },
  "PS0601": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.06 Pengawasan & Pengendalian BMN",
    rincianDefault: "Pengawasan dan Pemantauan Tertib Administrasi BMN",
  },
  "PS0602": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.06 Penertiban & Pengamanan BMN",
    rincianPre2018: "PS.06.02 Penertiban Fisik dan Yuridis Tanah serta Bangunan Gedung Negara",
    rincianPost2018: "PS 06 02 Sertifikasi Tanah & Penertiban Rumah Negara / Aset Sengketa",
    rincianDefault: "Penertiban dan Pengamanan Fisik / Yuridis Aset BMN",
  },
  "PS0603": {
    fungsi: "Substantif / Pengelolaan BMN",
    pokokMasalah: "PS - Pengelolaan Barang Milik Negara",
    subMasalah: "PS.06 Pelaporan & Rekonsiliasi BMN",
    rincianDefault: "Rekonsiliasi Pemutakhiran Data dan Laporan Barang Milik Negara",
  },

  // Hukum (HK)
  "HK0101": {
    fungsi: "Fasilitatif / Produk Hukum",
    pokokMasalah: "HK - Hukum",
    subMasalah: "HK.01 Peraturan Perundang-undangan",
    rincianDefault: "Penyusunan Rancangan Peraturan Perundang-undangan",
  },
  "HK0102": {
    fungsi: "Fasilitatif / Produk Hukum",
    pokokMasalah: "HK - Hukum",
    subMasalah: "HK.01 Peraturan & Keputusan Menteri",
    rincianPre2018: "HK.01.02 Keputusan Menteri (Kepmen) Departemen Pekerjaan Umum",
    rincianPost2018: "HK 01 02 Peraturan & Keputusan Menteri PUPR Bidang Infrastruktur & Pengelolaan Aset",
    rincianDefault: "Keputusan Menteri / Peraturan Bidang Pekerjaan Umum",
  },
  "HK0201": {
    fungsi: "Fasilitatif / Bantuan Hukum",
    pokokMasalah: "HK - Hukum",
    subMasalah: "HK.02 Bantuan & Pertimbangan Hukum",
    rincianDefault: "Pemberian Pendapat Hukum (Legal Opinion) dan Pendampingan Hukum Kedinasan",
  },
  "HK0601": {
    fungsi: "Substantif & Advokasi Hukum",
    pokokMasalah: "HK - Hukum",
    subMasalah: "HK.06 Penanganan Perkara & Litigasi",
    rincianPre2018: "HK.06.01 Penanganan Perkara Perdata dan Sengketa Kepemilikan Tanah PU",
    rincianPost2018: "HK 06 01 Gugatan Perdata, Penanganan Sengketa Lahan BMN, dan Eksekusi Putusan Inkracht",
    rincianDefault: "Penanganan Perkara Perdata dan Sengketa Kepemilikan Lahan Aset BMN",
  },
  "HK0602": {
    fungsi: "Substantif & Advokasi Hukum",
    pokokMasalah: "HK - Hukum",
    subMasalah: "HK.06 Perkara Tata Usaha Negara (TUN) & Pidana",
    rincianDefault: "Penanganan Perkara Tata Usaha Negara (TUN) dan Pengaduan Pidana Khusus Aset",
  },

  // Perencanaan (PL)
  "PL0202": {
    fungsi: "Fasilitatif / Perencanaan Kerjasama",
    pokokMasalah: "PL - Perencanaan",
    subMasalah: "PL.02 Kerjasama Pemanfaatan Lahan",
    rincianPre2018: "PL.02.02 Kerjasama Teknis dan Pemanfaatan Lahan Milik Departemen PU",
    rincianPost2018: "PL 02 02 Rencana Teknis Kerjasama Pemanfaatan Aset Infrastruktur & Gedung Kantor",
    rincianDefault: "Perencanaan Kerjasama Pemanfaatan Lahan dan Gedung Negara",
  },
  "PL0604": {
    fungsi: "Fasilitatif / Evaluasi Program",
    pokokMasalah: "PL - Perencanaan",
    subMasalah: "PL.06 Program & Anggaran",
    rincianDefault: "Evaluasi Pelaksanaan Program dan Penganggaran Pengelolaan Infrastruktur",
  },

  // Cipta Karya (CK)
  "CK0403": {
    fungsi: "Teknis Substantif / Cipta Karya",
    pokokMasalah: "CK - Cipta Karya",
    subMasalah: "CK.04 Penataan Bangunan Gedung Negara",
    rincianDefault: "Standarisasi dan Bimbingan Teknis Bangunan Gedung Negara serta Lingkungan",
  },
  "CK0501": {
    fungsi: "Teknis Substantif / Cipta Karya",
    pokokMasalah: "CK - Cipta Karya",
    subMasalah: "CK.05 Penyehatan Lingkungan Permukiman",
    rincianDefault: "Penyelenggaraan Sarana dan Prasarana Sanitasi serta Penyehatan Lingkungan",
  },

  // Keuangan (KU)
  "KU0207": {
    fungsi: "Fasilitatif / Keuangan",
    pokokMasalah: "KU - Keuangan",
    subMasalah: "KU.02 Perbendaharaan & Ganti Rugi",
    rincianDefault: "Penyelesaian Kerugian Negara, Tuntutan Perbendaharaan, dan Tuntutan Ganti Rugi (TPTGR)",
  },
  "KU0503": {
    fungsi: "Fasilitatif / Keuangan",
    pokokMasalah: "KU - Keuangan",
    subMasalah: "KU.05 Akuntansi & Pelaporan Keuangan",
    rincianDefault: "Laporan Keuangan Kementerian dan Catatan atas Laporan Keuangan (CaLK)",
  },

  // Pengawasan (PW)
  "PW0201": {
    fungsi: "Pengawasan Intern",
    pokokMasalah: "PW - Pengawasan",
    subMasalah: "PW.02 Audit & Pemeriksaan",
    rincianDefault: "Laporan Hasil Pemeriksaan (LHP) Kinerja & Kepatuhan dari BPK / Inspektorat Jenderal",
  },
  "PW0202": {
    fungsi: "Pengawasan Intern",
    pokokMasalah: "PW - Pengawasan",
    subMasalah: "PW.02 Tindak Lanjut Pengawasan",
    rincianDefault: "Tindak Lanjut Hasil Pengawasan (TLHP) Pengelolaan BMN dan Rekomendasi Audit",
  },

  // Organisasi & Tata Laksana (OR)
  "OR0101": {
    fungsi: "Fasilitatif / Organisasi",
    pokokMasalah: "OR - Organisasi dan Ketatalaksanaan",
    subMasalah: "OR.01 Kelembagaan & Analisis Beban Kerja",
    rincianDefault: "Penataan Struktur Organisasi dan Tata Kerja Unit Pengelola BMN",
  },
  "OR04": {
    fungsi: "Fasilitatif / Ketatalaksanaan",
    pokokMasalah: "OR - Organisasi dan Ketatalaksanaan",
    subMasalah: "OR.04 Prosedur Kerja & SOP",
    rincianDefault: "Penyusunan Standar Operasional Prosedur (SOP) dan Petunjuk Teknis Pelayanan",
  },

  // Kepegawaian (KP)
  "KP0501": {
    fungsi: "Fasilitatif / Kepegawaian",
    pokokMasalah: "KP - Kepegawaian",
    subMasalah: "KP.05 Disiplin & Kesejahteraan Pegawai",
    rincianDefault: "Pengelolaan Fasilitas Kedinasan dan Kesejahteraan Pegawai",
  },
  "KP0601": {
    fungsi: "Fasilitatif / Kepegawaian",
    pokokMasalah: "KP - Kepegawaian",
    subMasalah: "KP.06 Pemberhentian & Pensiun",
    rincianDefault: "Pemberhentian Hak Kedinasan, Pensiun Pegawai, dan Pengembalian Rumah Dinas / BMN",
  },

  // Umum & Tata Persuratan (UM)
  "UM0102": {
    fungsi: "Fasilitatif / Kearsipan",
    pokokMasalah: "UM - Umum",
    subMasalah: "UM.01 Tata Persuratan & Ekspedisi",
    rincianDefault: "Penyelenggaraan Tata Persuratan Dinas, Distribusi Naskah, dan Ekspedisi Surat",
  },
  "UM0301": {
    fungsi: "Fasilitatif / Rumah Tangga",
    pokokMasalah: "UM - Umum",
    subMasalah: "UM.03 Rumah Tangga Perkantoran",
    rincianDefault: "Pengelolaan Sarana dan Prasarana Gedung Kantor serta Pemeliharaan Gedung",
  },

  // Humas (HM)
  "HM0501": {
    fungsi: "Fasilitatif / Kehumasan",
    pokokMasalah: "HM - Hubungan Masyarakat",
    subMasalah: "HM.05 Publikasi & Dokumentasi",
    rincianDefault: "Peliputan, Dokumentasi Kegiatan Kedinasan, dan Publikasi Pengelolaan Aset",
  },

  // Tata Ruang (RU)
  "RU0902": {
    fungsi: "Substantif / Penataan Ruang",
    pokokMasalah: "RU - Tata Ruang",
    subMasalah: "RU.09 Evaluasi Penataan Ruang",
    rincianDefault: "Evaluasi Pemanfaatan Ruang Wilayah dan Kawasan Strategis Nasional",
  },

  // SDM (SM)
  "SM0304": {
    fungsi: "Fasilitatif / Pengembangan SDM",
    pokokMasalah: "SM - Sumber Daya Manusia",
    subMasalah: "SM.03 Pembinaan Profesi & Kompetensi",
    rincianDefault: "Pelatihan Kompetensi Pengelola BMN dan Sertifikasi Pengelola Aset Negara",
  },
};

/**
 * Menentukan apakah arsip tercipta sebelum bulan Oktober 2018
 */
export function isCreatedBeforeOctober2018(tahun: number, uraian: string = "", judul: string = ""): boolean {
  if (!tahun || tahun < 2018) return true;
  if (tahun > 2018) return false;

  // Tahun 2018: cek teks uraian / judul
  const text = `${uraian} ${judul}`.toLowerCase();
  const postOctoberMonths = ["oktober", "november", "desember", "10/2018", "11/2018", "12/2018", "-10-2018", "-11-2018", "-12-2018"];
  const isPostOct = postOctoberMonths.some((month) => text.includes(month));

  return !isPostOct;
}

/**
 * Menerjemahkan kode klasifikasi arsip berdasarkan periode regulasi kearsipan
 */
export function translateClassificationCode(
  kode: string,
  tahun: number,
  uraian: string = "",
  judul: string = "",
  skkaad: string = "Terbuka",
  jenisArsip: string = "INAKTIF"
): CodeTranslation {
  const kodeBersih = (kode || "-").replace(/\s+/g, "").toUpperCase();
  const isPreOct2018 = isCreatedBeforeOctober2018(tahun, uraian, judul);
  const periodeRegulasi = isPreOct2018 ? "PRE_OCT_2018" : "POST_OCT_2018";

  const namaRegulasi = isPreOct2018
    ? "Permen PU No. 38 Tahun 2007 (Pedoman Pola Klasifikasi Arsip Departemen Pekerjaan Umum)"
    : "Permen PUPR No. 16/PRT/M/2018 (Klasifikasi Arsip Kementerian Pekerjaan Umum dan Perumahan Rakyat)";

  const entry = CLASSIFICATION_DICTIONARY[kodeBersih];

  let fungsi = "Pengelolaan Barang Milik Negara & Fasilitatif";
  let pokokMasalah = "Klasifikasi Naskah Dinas Kementerian PU";
  let subMasalah = "Urusan Kedinasan Umum";
  let rincian = "Naskah dinas dalam lingkup pelaksanaan tugas dan fungsi Kementerian Pekerjaan Umum.";

  if (entry) {
    fungsi = entry.fungsi;
    pokokMasalah = entry.pokokMasalah;
    subMasalah = entry.subMasalah;
    if (isPreOct2018 && entry.rincianPre2018) {
      rincian = entry.rincianPre2018;
    } else if (!isPreOct2018 && entry.rincianPost2018) {
      rincian = entry.rincianPost2018;
    } else {
      rincian = entry.rincianDefault;
    }
  } else {
    // Fallback berdasarkan prefix huruf 2 karakter
    const prefix2 = kodeBersih.substring(0, 2);
    if (prefix2 === "PS") {
      pokokMasalah = "PS - Pengelolaan Barang Milik Negara";
      fungsi = "Substantif / Pengelolaan BMN";
      subMasalah = "Pengelolaan Sarana dan Prasarana Aset BMN";
      rincian = "Administrasi pengelolaan, penatausahaan, atau pengamanan Barang Milik Negara.";
    } else if (prefix2 === "HK") {
      pokokMasalah = "HK - Hukum";
      fungsi = "Fasilitatif / Produk & Bantuan Hukum";
      subMasalah = "Peraturan, Bantuan Hukum, atau Litigasi Sengketa Aset";
      rincian = "Dokumen hukum, advokasi, putusan pengadilan, atau peraturan perundang-undangan.";
    } else if (prefix2 === "PL") {
      pokokMasalah = "PL - Perencanaan";
      fungsi = "Fasilitatif / Perencanaan";
      subMasalah = "Perencanaan Teknis dan Kerjasama Lahan";
      rincian = "Perencanaan program, evaluasi, atau kerjasama pengelolaan lahan infrastruktur.";
    } else if (prefix2 === "CK") {
      pokokMasalah = "CK - Cipta Karya";
      fungsi = "Teknis Substantif / Cipta Karya";
      subMasalah = "Gedung Negara & Penataan Lingkungan";
      rincian = "Pengelolaan teknis bangunan gedung negara dan penyehatan lingkungan permukiman.";
    } else if (prefix2 === "KU") {
      pokokMasalah = "KU - Keuangan";
      fungsi = "Fasilitatif / Keuangan";
      subMasalah = "Perbendaharaan, Akuntansi, atau Pertanggungjawaban";
      rincian = "Tata kelola keuangan negara, perbendaharaan, atau penyelesaian ganti rugi.";
    } else if (prefix2 === "PW") {
      pokokMasalah = "PW - Pengawasan Intern";
      fungsi = "Pengawasan";
      subMasalah = "Pemeriksaan Kinerja & Rekomendasi Audit";
      rincian = "Laporan hasil pengawasan, kepatuhan, atau tindak lanjut rekomendasi pengawasan.";
    }
  }

  // Evaluasi SKKAAD Sesuai Permen PUPR No. 27 Tahun 2021
  const cleanSkkaad = (skkaad || "Terbuka").trim();
  let skkaadHakAkses = "Terbuka untuk Umum / Seluruh Pegawai Kementerian PU";
  let skkaadKeterangan = "Naskah publikasi atau ketetapan dinas yang tidak mengandung informasi rahasia negara.";

  if (cleanSkkaad.toLowerCase() === "terbatas") {
    skkaadHakAkses = "Terbatas bagi Unit Kerja Pengolah (Biro PBMN) dan Instansi Terkait";
    skkaadKeterangan = "Memerlukan izin atau disposisi kedinasan sebelum digandakan atau diakses pihak luar.";
  } else if (cleanSkkaad.toLowerCase() === "rahasia") {
    skkaadHakAkses = "Sangat Ketat: Hanya Pimpinan Tinggi & Pejabat Tertunjuk";
    skkaadKeterangan = "Dokumen bernilai pembuktian strategis, sengketa hak milik, atau data aset rahasia negara.";
  }

  // Evaluasi Penyelenggaraan Arsip Dinamis Sesuai Permen PU RI No. 15 Tahun 2026
  const isAktif = (jenisArsip || "INAKTIF").toUpperCase() === "AKTIF";
  const penyelenggaraanInfo = {
    dasarHukum: "Permen PU RI No. 15 Tahun 2026 tentang Penyelenggaraan Arsip Dinamis Kementerian Pekerjaan Umum",
    tahapSiklus: isAktif ? "Arsip Dinamis Aktif (Frekuensi Penggunaan Tinggi)" : "Arsip Dinamis Inaktif (Masa Simpan Retensi)",
    unitPenanggungJawab: isAktif
      ? "Unit Pengolah / Central File (Ruang Kerja Biro PBMN & Pelaksana Teknis)"
      : "Unit Kearsipan / Record Center (Ruang Simpan Boks Lt. 4 Gedung Menteri PU)",
    prosedurPengelolaan: isAktif
      ? "Dikelola langsung pada berkas kerja operasional harian untuk kelancaran tugas dinas."
      : "Tertata dalam boks fisik terstandarisasi, dilakukan evaluasi JRA secara berkala untuk usul musnah atau serah permanen ke ANRI.",
  };

  return {
    kode: kode || "-",
    kodeBersih,
    dasarHukum: namaRegulasi,
    periodeRegulasi,
    namaRegulasi,
    fungsi,
    pokokMasalah,
    subMasalah,
    rincian,
    skkaadInfo: {
      kategori: cleanSkkaad,
      dasarHukum: "Permen PUPR No. 27 Tahun 2021 tentang Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis",
      hakAkses: skkaadHakAkses,
      keterangan: skkaadKeterangan,
    },
    penyelenggaraanInfo,
  };
}
