/**
 * Mesin Klasifikasi Pencipta Arsip 3 Tingkat
 * 1. Biro PBMN (Internal Pengelola BMN)
 * 2. Kementerian PU (Unit Kerja Internal Lainnya dalam Kementerian PU)
 * 3. Eksternal (Kementerian/Lembaga Lain, Pemda, Pengadilan, Swasta, dan Masyarakat)
 */

export type CreatorCategory = "Biro PBMN" | "Kementerian PU" | "Eksternal";

export interface CreatorClassification {
  kategori: CreatorCategory;
  namaLengkap: string;
  subUnit: string;
}

export function classifyCreator(
  judul: string = "",
  uraian: string = "",
  rubrik: string = "",
  currentPencipta: string = ""
): CreatorClassification {
  const combined = `${judul} ${uraian} ${rubrik} ${currentPencipta}`.toLowerCase();

  // 1. Deteksi Eksternal (Kementerian/Lembaga Luar, Pemda, Swasta, Lembaga Peradilan, dsb.)
  const eksternalKeywords = [
    "kemenkeu", "kementerian keuangan", "djkn", "kanwil djkn", "kpknl",
    "bpn", "agraria", "pertanahan nasional", "kantor pertanahan",
    "kemenag", "kementerian agama", "kemenkumham", "kemendikbud", "kemendikbudristek",
    "kemenkes", "kemhan", "kemenhan", "kemenhub", "kementerian perhubungan",
    "kemensetneg", "setneg", "sekretariat negara", "sekretariat kabinet",
    "mahkamah agung", "mahkamah konstitusi", "pengadilan negeri", "pengadilan tinggi", "putusan pn",
    "kejaksaan", "kepolisian", "polri", "polda", "polres",
    "bpk ri", "badan pemeriksa keuangan", "bpkp", "dpr ri", "dpr", "dpd",
    "pemerintah daerah", "pemda", "pemprov", "pemkab", "pemkot",
    "bupati", "walikota", "gubernur", "kelurahan", "kecamatan", "desa",
    "dinas pu daerah", "dinas pekerjaan umum provinsi", "dinas bina marga provinsi",
    "pjt ii", "perum jasa tirta", "pt pln", "pln", "pt telkom", "pt kai",
    "pt semen", "pt waskita", "pt wijaya karya", "pt pp", "pt adhi karya", "pt hutama karya",
    "swasta", "pt ", "cv ", "yayasan", "lsm", "warga", "masyarakat", "ahli waris"
  ];

  // Khusus: Periksa apakah ada indikasi instansi luar yang dominan
  const isExternalMatch = eksternalKeywords.some((kw) => combined.includes(kw));

  // 2. Deteksi Biro PBMN (Biro Pengelolaan Barang Milik Negara & Sub-bagiannya)
  const pbmnKeywords = [
    "biro pengelolaan barang milik negara", "biro pengelolaan pbmn", "biro pbmn", "bu karo",
    "kepala biro pengelolaan bmn", "bagian pemindahtanganan", "bagian pemusnahan",
    "bagian penghapusan", "bagian pemanfaatan", "bagian pengamanan",
    "bagian penatausahaan", "bagian penggunaan", "rencana kebutuhan bmn",
    "bagian pemantauan", "bagian pemulihan", "pmh bmn", "pmh",
    "penatausahaan bmn", "penghapusan bmn", "pemindahtanganan bmn",
    "hibah bmn", "alih status bmn", "penetapan status penggunaan bmn",
    "ruang rapat biro pbmn", "arsip inaktif bmn"
  ];

  const isPbmnMatch = pbmnKeywords.some((kw) => combined.includes(kw));

  // 3. Deteksi Kementerian PU Internal (Unit Eselon I / Satker lain)
  const puInternalKeywords = [
    "cipta karya", "ditjen cipta karya", "sumber daya air", "ditjen sda",
    "bina marga", "ditjen bina marga", "perumahan", "ditjen perumahan", "penyediaan perumahan",
    "sekretariat jenderal", "setjen", "inspektorat jenderal", "itjen",
    "badan pengembangan sdm", "bpsdm", "badan pengembangan infrastruktur", "bpiw",
    "balai besar pelaksanaan jalan", "bbpjn", "balai pelaksanaan jalan nasional", "bpjn",
    "balai besar wilayah sungai", "bbws", "balai wilayah sungai", "bws",
    "balai prasarana permukiman", "bppw", "balai pelaksana penyediaan perumahan", "bp2p",
    "gedung menteri pu", "menteri pekerjaan umum", "menteri pupr"
  ];

  const isPuInternalMatch = puInternalKeywords.some((kw) => combined.includes(kw));

  // Logika Prioritas Klasifikasi
  if (isPbmnMatch && !isExternalMatch) {
    let subUnit = "Biro Pengelolaan BMN";
    if (combined.includes("pemindahtanganan") || combined.includes("penghapusan") || combined.includes("pemusnahan") || combined.includes("pmh")) {
      subUnit = "Bagian Pemindahtanganan, Pemusnahan, dan Penghapusan BMN";
    } else if (combined.includes("pemanfaatan") || combined.includes("pengamanan")) {
      subUnit = "Bagian Pemanfaatan dan Pengamanan BMN";
    } else if (combined.includes("penatausahaan") || combined.includes("penggunaan") || combined.includes("rk bmn")) {
      subUnit = "Bagian Penatausahaan, Penggunaan, dan Rencana Kebutuhan BMN";
    } else if (combined.includes("pemantauan") || combined.includes("pemulihan")) {
      subUnit = "Bagian Pemantauan dan Pemulihan BMN";
    }
    return {
      kategori: "Biro PBMN",
      namaLengkap: `Biro Pengelolaan BMN - ${subUnit}`,
      subUnit,
    };
  }

  if (isExternalMatch) {
    let subUnit = "Instansi / Lembaga Eksternal";
    if (combined.includes("kemenkeu") || combined.includes("djkn")) {
      subUnit = "Kementerian Keuangan (DJKN)";
    } else if (combined.includes("bpn") || combined.includes("agraria") || combined.includes("pertanahan")) {
      subUnit = "Kementerian ATR/BPN";
    } else if (combined.includes("pemda") || combined.includes("pemprov") || combined.includes("pemkab") || combined.includes("pemkot")) {
      subUnit = "Pemerintah Daerah (Pemprov/Pemkab/Pemkot)";
    } else if (combined.includes("pengadilan") || combined.includes("mahkamah")) {
      subUnit = "Lembaga Peradilan (MA / MK / PN)";
    } else if (combined.includes("pjt ii") || combined.includes("pln") || combined.includes("bumn") || combined.includes("pt ")) {
      subUnit = "BUMN / Mitra Kerjasama Swasta";
    } else if (combined.includes("kemenag") || combined.includes("agama")) {
      subUnit = "Kementerian Agama";
    }
    return {
      kategori: "Eksternal",
      namaLengkap: currentPencipta && currentPencipta !== "Kementerian PUPR" ? currentPencipta : subUnit,
      subUnit,
    };
  }

  if (isPuInternalMatch) {
    let subUnit = "Unit Organisasi Kementerian PU";
    if (combined.includes("cipta karya")) {
      subUnit = "Ditjen Cipta Karya";
    } else if (combined.includes("sumber daya air") || combined.includes("sda") || combined.includes("bbws") || combined.includes("bws")) {
      subUnit = "Ditjen Sumber Daya Air";
    } else if (combined.includes("bina marga") || combined.includes("bbpjn") || combined.includes("bpjn")) {
      subUnit = "Ditjen Bina Marga";
    } else if (combined.includes("perumahan") || combined.includes("bp2p")) {
      subUnit = "Ditjen Perumahan";
    } else if (combined.includes("setjen") || combined.includes("sekretariat jenderal")) {
      subUnit = "Sekretariat Jenderal Kementerian PU";
    } else if (combined.includes("itjen") || combined.includes("inspektorat")) {
      subUnit = "Inspektorat Jenderal Kementerian PU";
    }
    return {
      kategori: "Kementerian PU",
      namaLengkap: `Kementerian PU - ${subUnit}`,
      subUnit,
    };
  }

  // Default fallback: Biro PBMN (karena arsip dikelola dan ditatausahakan oleh Biro PBMN)
  return {
    kategori: "Biro PBMN",
    namaLengkap: "Biro Pengelolaan BMN (Kementerian PU)",
    subUnit: "Biro Pengelolaan BMN",
  };
}
