"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Box, 
  FileText, 
  Printer, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Trash2,
  Eye,
  LogIn
} from "lucide-react";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; role: string; nama_lengkap: string } | null>(null);

  // Detail Modal State
  const [selectedArchive, setSelectedArchive] = useState<any | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    // Default state: pengguna publik
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
      <div className="bg-white rounded-3xl p-12 border border-[#E7E5DF] text-center text-sm text-[#6C727E] shadow-sm">
        <div className="animate-spin w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full mx-auto mb-3" />
        Memuat statistik dan analitik kearsipan...
      </div>
    );
  }

  const {
    totalArchives = 0,
    pdfCount = 0,
    siapMusnahCount = 0,
    usulPermanenCount = 0,
    dalamRetensiCount = 0,
    totalBoxes = 0,
    boxCounts = {},
    rubrikCounts = {},
    jraMusnahList = [],
  } = stats || {};

  return (
    <div className="space-y-6">

      {/* Header Halaman Dashboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
              Dashboard & Analitik <span className="text-[#3B82F6]">JRA</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              Permen PUPR 26/2021
            </span>
          </div>
          <p className="text-xs text-[#6C727E] mt-1">
            Monitoring masa retensi aktif/inaktif dan persiapan penyusutan arsip Biro PBMN.
          </p>
        </div>

        {/* Tombol Berita Acara Pemusnahan (Hanya muncul jika login) */}
        {user ? (
          <Link
            href="/berita-acara"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2D323A] hover:bg-black text-white text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
            Draft Berita Acara Pemusnahan
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold shadow-sm transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login untuk Susun Berita Acara
          </Link>
        )}
      </div>

      {/* Peringatan Utama: Jadwal Retensi Arsip (Permen PUPR No. 26 Tahun 2021) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-l-4 border-l-red-500 border border-[#E7E5DF] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-red-700">
                  Pemberitahuan Retensi: {siapMusnahCount} Berkas Siap Diusulkan Musnah
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                  Kedaluwarsa
                </span>
              </div>
              <p className="text-xs text-[#6C727E] mt-1 max-w-2xl leading-relaxed">
                Sesuai <strong>Peraturan Menteri PUPR Nomor 26 Tahun 2021</strong>, arsip fasilitatif umum dan rutin dengan masa simpan di atas 5–8 tahun (seperti berkas tahun 1990 s.d. 2017) sudah dapat diajukan dalam usulan pemusnahan resmi untuk mengosongkan ruang simpan boks.
              </p>
            </div>
          </div>

          {user && (
            <Link
              href="/berita-acara"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition shrink-0"
            >
              Susun Usulan Pemusnahan &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Metrik 4 Kolom Japandi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Berkas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-sm space-y-1">
          <span className="text-[11px] text-[#6C727E] font-medium block">Total Naskah Terindeks</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2D323A]">{totalArchives}</div>
          <span className="text-[11px] text-[#2563EB] font-semibold">Tersimpan di SQLite Lokal</span>
        </div>

        {/* Siap Dimusnahkan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200 shadow-sm space-y-1 bg-red-50/20">
          <span className="text-[11px] text-red-600 font-bold block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Siap Dimusnahkan (JRA)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600">{siapMusnahCount}</div>
          <span className="text-[11px] text-[#6C727E]">Masa inaktif &gt; 5-8 tahun</span>
        </div>

        {/* Usul Permanen */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm space-y-1 bg-amber-50/20">
          <span className="text-[11px] text-amber-700 font-bold block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Usul Serah Permanen
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{usulPermanenCount}</div>
          <span className="text-[11px] text-[#6C727E]">BAST & Kepmen &gt; 12 thn</span>
        </div>

        {/* Dalam Masa Simpan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <span className="text-[11px] text-emerald-700 font-bold block flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Dalam Masa Simpan
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{dalamRetensiCount}</div>
          <span className="text-[11px] text-[#6C727E]">Retensi masih berjalan</span>
        </div>
      </div>

      {/* Bagian Daftar Berkas Prioritas Pemusnahan (DAPAT DIKLIK OLEH PENGGUNA) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EFEA]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2D323A]">
              Daftar Sampel Berkas Rekomendasi Pemusnahan
            </h3>
            <p className="text-xs text-[#6C727E]">
              Klik pada baris berkas di bawah untuk membuka informasi detail naskah kearsipan.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF9F5] border border-[#E7E5DF] text-[#4A505C] rounded-xl">
            Menampilkan 20 Berkas Tertua
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold uppercase">
                <th className="p-3 w-16 text-center">Tahun</th>
                <th className="p-3 w-24">Kode</th>
                <th className="p-3 w-64">Indeks / Judul</th>
                <th className="p-3 min-w-[240px]">Uraian Masalah / Kegiatan</th>
                <th className="p-3 min-w-[6rem] text-center whitespace-nowrap">Boks</th>
                <th className="p-3 w-32 text-center whitespace-nowrap">Masa Retensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {jraMusnahList.map((item: any) => (
                <tr 
                  key={item.id} 
                  onClick={() => openDetail(item)}
                  className="hover:bg-[#FEF3C7]/20 transition cursor-pointer group"
                >
                  <td className="p-3 text-center font-bold text-red-600">
                    {item.tahun}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#2563EB]">
                    {item.kode}
                  </td>
                  <td className="p-3 font-bold text-[#2D323A] group-hover:text-[#3B82F6]">
                    {item.judul}
                  </td>
                  <td className="p-3 text-[#6C727E] line-clamp-2">
                    {item.uraian}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E7E5DF] font-bold text-[#4A505C] text-xs">
                      {item.box}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-xs text-[#2D323A] px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E7E5DF] inline-block">
                      {item.jra?.tahunHabisRetensi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid 2 Kolom: Kapasitas Boks Fisik & Komposisi Rubrik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Utilisasi Boks Fisik */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D323A] flex items-center gap-2">
              <Box className="w-4 h-4 text-[#F59E0B]" />
              Sebaran Boks Arsip Fisik
            </h3>
            <span className="text-xs text-[#6C727E]">{totalBoxes} Boks Aktif</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(boxCounts).slice(0, 6).map(([boxName, count]: [string, any]) => {
              const maxEst = 30;
              const pct = Math.min(100, Math.round((count / maxEst) * 100));
              return (
                <div key={boxName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D323A] whitespace-nowrap">{boxName}</span>
                    <span className="text-[#6C727E]">{count} berkas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#FAF9F5] rounded-full h-2 overflow-hidden border border-[#E7E5DF]">
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

          {user && (
            <div className="pt-2 text-right">
              <Link href="/admin/storage" className="text-xs text-[#2563EB] font-bold hover:underline">
                Buka Peta Rak Lengkap &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Ringkasan Regulasi Permen PUPR 26/2021 */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#2D323A] flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#3B82F6]" />
            Ketentuan Jadwal Retensi Arsip PUPR
          </h3>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Peraturan Menteri PUPR No. 26/PRT/M/2021 mengatur tata kelola siklus arsip kearsipan:
          </p>

          <div className="space-y-2 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">1. Arsip Fasilitatif Umum</span>
              <span className="text-[#6C727E] text-[11px]">
                Masa Aktif 2 Thn &bull; Inaktif 3–5 Thn &bull; <strong>Nasib: Musnah</strong>
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">2. Arsip Pengelolaan BMN (BAST / Penetapan)</span>
              <span className="text-[#6C727E] text-[11px]">
                Masa Aktif 2 Thn &bull; Inaktif 10 Thn &bull; <strong>Nasib: Permanen (Serah ANRI)</strong>
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <span className="font-bold text-[#2D323A] block">3. Arsip Perkara & Sengketa Lahan</span>
              <span className="text-[#6C727E] text-[11px]">
                Inkracht + 10 Thn &bull; <strong>Nasib: Permanen (Bukti Abadi)</strong>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dialog Detail Berkas (Ketika Baris Rekomendasi Pemusnahan Diklik) */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              {selectedArchive?.kode}
            </span>
            <span className="text-sm font-bold text-[#2D323A]">
              Detail Rekaman Arsip #{selectedArchive?.id}
            </span>
          </div>
        }
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        className="w-[95vw] sm:w-[650px]"
        breakpoints={{ "960px": "75vw", "641px": "95vw" }}
      >
        {selectedArchive && (
          <div className="space-y-4 text-xs pt-1">
            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Indeks / Judul:</span>
              <h2 className="text-sm sm:text-base font-bold text-[#2D323A] mt-0.5">
                {selectedArchive.judul}
              </h2>
            </div>

            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Uraian Masalah / Perihal Surat:</span>
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] mt-1 leading-relaxed text-xs">
                {selectedArchive.uraian}
              </div>
            </div>

            {/* Grid Informasi Kearsipan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Nomor Berkas</span>
                <span className="font-bold text-[#2D323A] text-xs">
                  {selectedArchive.no_berkas}
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Tahun Dokumen</span>
                <span className="font-bold text-[#2D323A] text-xs">
                  {selectedArchive.tahun}
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Nomor Boks</span>
                <span className="font-bold text-[#2D323A] text-xs whitespace-nowrap">
                  {selectedArchive.box}
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Masa Retensi</span>
                <span className="font-mono font-bold text-xs text-red-600">
                  {selectedArchive.jra?.tahunHabisRetensi}
                </span>
              </div>
            </div>

            {/* Evaluasi JRA Permen PUPR 26/2021 */}
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rekomendasi Pemusnahan (Permen PUPR No. 26/2021)
                </span>
                <Tag
                  value="Siap Dimusnahkan"
                  severity="danger"
                  className="text-[10px] font-bold"
                />
              </div>
              <p className="text-[11px] text-red-900 leading-relaxed">
                Masa retensi inaktif telah terlewati sejak tahun <strong>{selectedArchive.jra?.tahunHabisRetensi}</strong>. Rekomendasi: Diusulkan untuk dimusnahkan melalui Panitia Penilai Arsip.
              </p>
            </div>

            {/* Lokasi Simpan Fisik */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6C727E] font-bold block uppercase tracking-wide">
                  📍 Lokasi Simpan Fisik
                </span>
                <div className="font-bold text-[#2D323A] text-xs mt-0.5">
                  {selectedArchive.box} &bull; {selectedArchive.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN"}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                label="Tutup"
                onClick={() => setDetailVisible(false)}
                className="p-button-secondary p-button-sm text-xs"
              />
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
