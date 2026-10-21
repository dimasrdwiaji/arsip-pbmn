"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Archive, 
  Box, 
  FileText, 
  Printer, 
  Trash2,
  Eye,
  LogIn
} from "lucide-react";
import { Dialog } from "primereact/dialog";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; role: string; nama_lengkap: string } | null>(null);

  // Detail Modal State
  const [selectedArchive, setSelectedArchive] = useState<any | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("arsip_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: any) => {
    setSelectedArchive(item);
    setDetailVisible(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
        <div className="animate-spin w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-2" />
        Memuat statistik dan analitik kearsipan...
      </div>
    );
  }

  const {
    totalArchives = 0,
    pdfCount = 0,
    aktifCount = 88,
    inaktifCount = 439,
    internalCount = 395,
    eksternalCount = 132,
    siapMusnahCount = 0,
    usulPermanenCount = 0,
    dalamRetensiCount = 0,
    totalBoxes = 0,
    boxCounts = {},
    jraMusnahList = [],
  } = stats || {};

  // Sort box keys numerically
  const sortedBoxes = Object.entries(boxCounts).sort(([a], [b]) => {
    const numA = parseInt(a.replace(/\D+/g, "") || "0", 10);
    const numB = parseInt(b.replace(/\D+/g, "") || "0", 10);
    return numA - numB;
  });

  return (
    <div className="space-y-5">

      {/* Header Halaman Dashboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
              Dashboard & Analitik <span className="text-[#3B82F6]">JRA</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              Permen PUPR No. 26/2021
            </span>
          </div>
          <p className="text-xs text-[#6C727E] mt-0.5">
            Monitoring siklus masa retensi aktif/inaktif dan persiapan penyusutan arsip Biro PBMN.
          </p>
        </div>

        {/* Tombol Berita Acara Pemusnahan (Akses untuk Petugas/Operator) */}
        {user ? (
          <Link
            href="/berita-acara"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D323A] hover:bg-black text-white text-xs font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
            Draft Berita Acara Pemusnahan
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold shadow-xs transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login untuk Susun Berita Acara
          </Link>
        )}
      </div>

      {/* Banner Peringatan Jadwal Retensi Arsip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-l-4 border-l-red-500 border border-[#E7E5DF] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-red-700">
                  Pemberitahuan Retensi: {siapMusnahCount} Berkas Memenuhi Syarat Musnah
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                  Lewat Retensi
                </span>
              </div>
              <p className="text-xs text-[#6C727E] mt-1 max-w-2xl leading-relaxed">
                Berdasarkan <strong>Permen PUPR No. 26/2021</strong>, berkas naskah umum dan rutin dengan masa simpan di atas 5-8 tahun (tahun pembuatan 1990 s.d. 2017) sudah dapat diajukan ke panitia pemusnahan resmi untuk mengosongkan kapasitas boks penyimpanan.
              </p>
            </div>
          </div>

          {user && (
            <Link
              href="/berita-acara"
              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              Susun Berita Acara &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Metrik 4 Kolom Status Retensi JRA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-[#E7E5DF] shadow-xs space-y-1">
          <span className="text-[11px] text-[#6C727E] font-medium block">Total Berkas Terindeks</span>
          <div className="text-2xl font-extrabold text-[#2D323A]">{totalArchives}</div>
          <span className="text-[11px] text-[#2563EB] font-semibold">{pdfCount} Berkas Ber-PDF</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-xs space-y-1 bg-red-50/20">
          <span className="text-[11px] text-red-600 font-bold block">
            Siap Dimusnahkan (JRA)
          </span>
          <div className="text-2xl font-extrabold text-red-600">{siapMusnahCount}</div>
          <span className="text-[11px] text-[#6C727E]">Masa inaktif lewat 5-8 thn</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
          <span className="text-[11px] text-amber-700 font-bold block">
            Usul Serah Permanen
          </span>
          <div className="text-2xl font-extrabold text-amber-600">{usulPermanenCount}</div>
          <span className="text-[11px] text-[#6C727E]">Aset & Kepmen bukti abadi</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
          <span className="text-[11px] text-emerald-700 font-bold block">
            Dalam Masa Simpan
          </span>
          <div className="text-2xl font-extrabold text-emerald-600">{dalamRetensiCount}</div>
          <span className="text-[11px] text-[#6C727E]">Retensi masih berlaku</span>
        </div>
      </div>

      {/* Komposisi Siklus & Asal Pencipta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Siklus Arsip: Aktif vs Inaktif */}
        <div className="bg-white rounded-xl p-4 border border-[#E7E5DF] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-[#6C727E] font-bold uppercase tracking-wider block">
              Siklus Pengelolaan Arsip
            </span>
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#6C727E]">Arsip Inaktif (Record Center):</span>{" "}
                <strong className="text-[#2D323A] font-mono text-sm">{inaktifCount}</strong>
              </div>
              <span className="text-[#E7E5DF]">|</span>
              <div>
                <span className="text-[#6C727E]">Arsip Aktif (Unit Kerja):</span>{" "}
                <strong className="text-emerald-700 font-mono text-sm">{aktifCount}</strong>
              </div>
            </div>
          </div>
          <Link href="/?status=AKTIF" className="text-xs text-[#2563EB] font-bold hover:underline">
            Filter &rarr;
          </Link>
        </div>

        {/* Asal Pencipta: Internal vs Eksternal */}
        <div className="bg-white rounded-xl p-4 border border-[#E7E5DF] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-[#6C727E] font-bold uppercase tracking-wider block">
              Asal Pencipta Naskah
            </span>
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[#6C727E]">Internal PUPR:</span>{" "}
                <strong className="text-blue-700 font-mono text-sm">{internalCount}</strong>
              </div>
              <span className="text-[#E7E5DF]">|</span>
              <div>
                <span className="text-[#6C727E]">Eksternal (Mitra/Instansi):</span>{" "}
                <strong className="text-amber-800 font-mono text-sm">{eksternalCount}</strong>
              </div>
            </div>
          </div>
          <Link href="/?pencipta=EKSTERNAL" className="text-xs text-[#2563EB] font-bold hover:underline">
            Filter &rarr;
          </Link>
        </div>

      </div>

      {/* Daftar Berkas Prioritas Pemusnahan (On Click Row Opens Detail) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0EFEA]">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#2D323A]">
              Daftar Sampel Berkas Rekomendasi Pemusnahan
            </h3>
            <p className="text-xs text-[#6C727E]">
              Klik pada baris berkas di bawah untuk membuka informasi detail naskah kearsipan.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF9F5] border border-[#E7E5DF] text-[#4A505C] rounded-lg">
            Menampilkan 20 Berkas Tertua
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase">
                <th className="p-3 w-16 text-center">Tahun</th>
                <th className="p-3 w-24">Kode</th>
                <th className="p-3 w-64">Indeks / Judul</th>
                <th className="p-3 min-w-[240px]">Uraian Masalah / Kegiatan</th>
                <th className="p-3 w-24 text-center whitespace-nowrap">Boks</th>
                <th className="p-3 w-28 text-center whitespace-nowrap">Masa Retensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {jraMusnahList.map((item: any) => (
                <tr 
                  key={item.id} 
                  onClick={() => openDetail(item)}
                  className="hover:bg-[#FAF9F5] transition cursor-pointer"
                >
                  <td className="p-3 text-center font-bold text-red-600">
                    {item.tahun}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#2563EB]">
                    {item.kode}
                  </td>
                  <td className="p-3 font-bold text-[#2D323A]">
                    {item.judul}
                  </td>
                  <td className="p-3 text-[#6C727E] line-clamp-2">
                    {item.uraian}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-[#F5F4EE] border border-[#E7E5DF] font-bold text-[#4A505C] text-xs font-mono">
                      {item.box}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-xs text-[#2D323A] px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E7E5DF] inline-block">
                      {item.jra?.tahunHabisRetensi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid 2 Kolom: Kapasitas Boks Fisik & Ketentuan JRA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sebaran Boks Fisik */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#2D323A] uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-4 h-4 text-[#F59E0B]" />
              Sebaran Boks Arsip Fisik ({totalBoxes} Boks)
            </h3>
            {user && (
              <Link href="/admin/storage" className="text-xs text-[#2563EB] font-bold hover:underline">
                Buka Peta Boks &rarr;
              </Link>
            )}
          </div>

          <div className="space-y-2.5 pt-1">
            {sortedBoxes.slice(0, 6).map(([boxName, count]: [string, any]) => {
              const maxEst = 30;
              const pct = Math.min(100, Math.round((count / maxEst) * 100));
              return (
                <div key={boxName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D323A] font-mono">{boxName}</span>
                    <span className="text-[#6C727E]">{count} berkas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#FAF9F5] rounded-full h-1.5 overflow-hidden border border-[#E7E5DF]">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        pct > 90 ? "bg-red-500" : pct > 60 ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Regulasi Permen PUPR 26/2021 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#2D323A] uppercase tracking-wider flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-[#3B82F6]" />
            Ketentuan Jadwal Retensi Arsip PUPR
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">1. Arsip Fasilitatif Umum</span>
              <span className="text-[#6C727E] text-[11px]">
                Masa Aktif 2 Thn &bull; Inaktif 3-5 Thn &bull; <strong>Nasib: Musnah</strong>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">2. Pengelolaan BMN (BAST / Alih Status)</span>
              <span className="text-[#6C727E] text-[11px]">
                Masa Aktif 2 Thn &bull; Inaktif 10 Thn &bull; <strong>Nasib: Permanen (Serah ANRI)</strong>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">3. Perkara & Sengketa Lahan</span>
              <span className="text-[#6C727E] text-[11px]">
                Inkracht + 10 Thn &bull; <strong>Nasib: Permanen (Bukti Abadi)</strong>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dialog Detail Berkas */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              {selectedArchive?.kode}
            </span>
            <span className="text-sm font-bold text-[#2D323A]">
              Detail Berkas #{selectedArchive?.no_berkas} ({selectedArchive?.tahun})
            </span>
          </div>
        }
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        className="w-[95vw] sm:w-[600px]"
      >
        {selectedArchive && (
          <div className="space-y-3.5 text-xs pt-1">
            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Indeks / Judul:</span>
              <h2 className="text-sm font-bold text-[#2D323A] mt-0.5">
                {selectedArchive.judul}
              </h2>
            </div>

            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Uraian Masalah:</span>
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] mt-1 leading-relaxed">
                {selectedArchive.uraian}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <div><strong>Boks:</strong> {selectedArchive.box}</div>
              <div><strong>Tahun:</strong> {selectedArchive.tahun}</div>
              <div><strong>Masa Retensi:</strong> {selectedArchive.jra?.tahunHabisRetensi}</div>
              <div><strong>Nasib Akhir:</strong> {selectedArchive.jra?.nasibAkhir}</div>
              <div className="col-span-2"><strong>Pencipta:</strong> {selectedArchive.pencipta || "Internal PUPR"}</div>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
