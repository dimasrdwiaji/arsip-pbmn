/**
 * Mesin Kalkulasi Jadwal Retensi Arsip (JRA)
 * Berdasarkan Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat
 * Nomor 26 Tahun 2021 tentang Jadwal Retensi Arsip
 */

export interface JraEvaluation {
  retensiAktifTahun: number;
  retensiInaktifTahun: number;
  tahunHabisRetensi: number;
  nasibAkhir: "MUSNAH" | "PERMANEN" | "DINILAI_KEMBALI";
  statusJra: "SIAP_MUSNAH" | "USUL_PERMANEN" | "PERLU_PENILAIAN" | "DALAM_RETENSI";
  dasarHukum: string;
  badgeLabel: string;
  badgeSeverity: "danger" | "warning" | "success" | "info";
  catatanRetensi: string;
}

export function hitungJra(
  tahun: number,
  kode: string = "",
  rubrik: string = "",
  judul: string = ""
): JraEvaluation {
  const currentYear = new Date().getFullYear(); // e.g. 2026
  const cleanKode = (kode || "").toUpperCase().trim();
  const cleanRubrik = (rubrik || "").toUpperCase().trim();
  const cleanJudul = (judul || "").toUpperCase().trim();

  let retensiAktif = 2;
  let retensiInaktif = 5;
  let nasibAkhir: "MUSNAH" | "PERMANEN" | "DINILAI_KEMBALI" = "MUSNAH";
  let dasarHukum = "Permen PUPR No. 26/2021";
  let catatan = "Arsip fasilitatif umum/rutin";

  // Identifikasi kategori berdasarkan Permen PUPR 26/2021
  if (
    cleanRubrik.includes("SENGKETA") ||
    cleanKode.startsWith("HK") ||
    cleanJudul.includes("SENGKETA") ||
    cleanJudul.includes("PUTUSAN")
  ) {
    // Urusan Hukum & Perkara Lahan/Aset BMN
    retensiAktif = 2; // 2 tahun setelah inkracht
    retensiInaktif = 10;
    nasibAkhir = "PERMANEN";
    dasarHukum = "Permen PUPR 26/2021 (Hukum & Sengketa Aset)";
    catatan = "Arsip bernilai pembuktian hukum hak milik negara";
  } else if (
    cleanRubrik.includes("BAST") ||
    cleanRubrik.includes("ALIH STATUS") ||
    cleanKode.startsWith("PS 04") ||
    cleanJudul.includes("BAST") ||
    cleanJudul.includes("BERITA ACARA SERAH TERIMA") ||
    cleanJudul.includes("ALIH STATUS")
  ) {
    // Alih Status dan Pemanfaatan BMN
    retensiAktif = 2;
    retensiInaktif = 10;
    nasibAkhir = "PERMANEN";
    dasarHukum = "Permen PUPR 26/2021 (Pengelolaan BMN - Alih Status)";
    catatan = "Bukti kepemilikan dan penyerahan aset negara";
  } else if (
    cleanKode.startsWith("PS 05") ||
    cleanJudul.includes("TATA KELOLA") ||
    cleanJudul.includes("PENGHAPUSAN")
  ) {
    // Tata kelola & Penghapusan BMN
    retensiAktif = 2;
    retensiInaktif = 10;
    nasibAkhir = cleanJudul.includes("KEPUTUSAN MENTERI") ? "PERMANEN" : "DINILAI_KEMBALI";
    dasarHukum = "Permen PUPR 26/2021 (Pengelolaan BMN)";
    catatan = "Kebijakan dan tindak lanjut penghapusan aset";
  } else if (
    cleanKode.startsWith("JB") ||
    cleanJudul.includes("INVOICE") ||
    cleanJudul.includes("PEMELIHARAAN") ||
    cleanJudul.includes("SPK")
  ) {
    // Pengadaan & Pemeliharaan Rutin / SPK / Invoice
    retensiAktif = 2;
    retensiInaktif = 6;
    nasibAkhir = "MUSNAH";
    dasarHukum = "Permen PUPR 26/2021 (Fasilitatif Keuangan/Pengadaan)";
    catatan = "Rutin pemeliharaan/keuangan setelah diaudit";
  } else {
    // Arsip Umum Lainnya
    retensiAktif = 2;
    retensiInaktif = 3;
    nasibAkhir = "MUSNAH";
    dasarHukum = "Permen PUPR 26/2021 (Fasilitatif Umum)";
    catatan = "Surat dinas rutin dan pengantar umum";
  }

  const tahunHabisRetensi = (tahun || currentYear) + retensiAktif + retensiInaktif;
  let statusJra: "SIAP_MUSNAH" | "USUL_PERMANEN" | "PERLU_PENILAIAN" | "DALAM_RETENSI" = "DALAM_RETENSI";
  let badgeLabel = "Dalam Masa Simpan";
  let badgeSeverity: "danger" | "warning" | "success" | "info" = "success";

  if (tahunHabisRetensi <= currentYear) {
    if (nasibAkhir === "MUSNAH") {
      statusJra = "SIAP_MUSNAH";
      badgeLabel = "Siap Dimusnahkan";
      badgeSeverity = "danger";
    } else if (nasibAkhir === "PERMANEN") {
      statusJra = "USUL_PERMANEN";
      badgeLabel = "Usul Serah Permanen";
      badgeSeverity = "warning";
    } else {
      statusJra = "PERLU_PENILAIAN";
      badgeLabel = "Dinilai Kembali";
      badgeSeverity = "info";
    }
  } else {
    statusJra = "DALAM_RETENSI";
    badgeLabel = `Masa Simpan (s.d. ${tahunHabisRetensi})`;
    badgeSeverity = "success";
  }

  return {
    retensiAktifTahun: retensiAktif,
    retensiInaktifTahun: retensiInaktif,
    tahunHabisRetensi,
    nasibAkhir,
    statusJra,
    dasarHukum,
    badgeLabel,
    badgeSeverity,
    catatanRetensi: catatan,
  };
}
