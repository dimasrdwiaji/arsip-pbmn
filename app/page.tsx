"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  FileText, 
  Box, 
  MapPin, 
  Calendar, 
  Tag as TagIcon, 
  Eye, 
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

export default function PublicCatalogPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRubrik, setSelectedRubrik] = useState("ALL");
  const [selectedJra, setSelectedJra] = useState("ALL");
  const [selectedBox, setSelectedBox] = useState("ALL");
  const [selectedArchive, setSelectedArchive] = useState<any | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Filter options
  const [rubrikOptions, setRubrikOptions] = useState<string[]>([]);
  const [boxOptions, setBoxOptions] = useState<string[]>([]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedRubrik !== "ALL") params.set("rubrik", selectedRubrik);
      if (selectedJra !== "ALL") params.set("jra", selectedJra);
      if (selectedBox !== "ALL") params.set("box", selectedBox);

      const res = await fetch(`/api/archives?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setArchives(json.data);

        // Kumpulkan opsi filter unik
        const rubriks = Array.from(new Set(json.data.map((d: any) => d.rubrik).filter(Boolean))) as string[];
        const boxes = Array.from(new Set(json.data.map((d: any) => d.box).filter(Boolean))) as string[];
        setRubrikOptions(rubriks);
        setBoxOptions(boxes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArchives();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedRubrik, selectedJra, selectedBox]);

  const openDetail = (item: any) => {
    setSelectedArchive(item);
    setDialogVisible(true);
  };

  return (
    <div className="space-y-6">

      {/* Hero Section Japandi Minimalis dengan Aksen Lembut PUPR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E5DF] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EFF6FF] via-[#FEF3C7]/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            <span>✨ Terbuka untuk Seluruh Pegawai & Pengguna</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2D323A] leading-tight">
            Pencarian & Katalog <span className="text-[#3B82F6]">Arsip BMN</span>
          </h1>

          <p className="text-sm text-[#6C727E] leading-relaxed">
            Temu balik naskah arsip inaktif dan aktif Bagian PMH BMN. Dilengkapi evaluasi masa simpan otomatis sesuai{" "}
            <strong className="text-[#2D323A] font-semibold">Permen PUPR No. 26 Tahun 2021 tentang Jadwal Retensi Arsip</strong>.
          </p>

          {/* Search Bar Input Mobile-First */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor surat, proyek ('Suramadu'), 'Margajaya', 'PS 0501'..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] text-sm text-[#2D323A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#2D323A] p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={selectedRubrik}
              onChange={(e) => setSelectedRubrik(e.target.value)}
              className="py-3 px-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-semibold text-[#4A505C] focus:outline-none"
            >
              <option value="ALL">Semua Rubrik</option>
              {rubrikOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="mt-6 pt-4 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#6C727E] font-medium mr-1">Filter JRA:</span>
            <button
              onClick={() => setSelectedJra("ALL")}
              className={`px-3 py-1 rounded-full font-medium transition ${
                selectedJra === "ALL"
                  ? "bg-[#2D323A] text-white"
                  : "bg-[#FAF9F5] text-[#6C727E] border border-[#E7E5DF] hover:bg-white"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedJra("SIAP_MUSNAH")}
              className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                selectedJra === "SIAP_MUSNAH"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              🔴 Siap Dimusnahkan
            </button>
            <button
              onClick={() => setSelectedJra("USUL_PERMANEN")}
              className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                selectedJra === "USUL_PERMANEN"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              🟡 Usul Permanen
            </button>
            <button
              onClick={() => setSelectedJra("DALAM_RETENSI")}
              className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                selectedJra === "DALAM_RETENSI"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              🟢 Masa Simpan
            </button>
          </div>

          <div className="text-xs text-[#6C727E] font-medium">
            Ditemukan <strong className="text-[#2D323A] font-bold">{archives.length}</strong> naskah berkas
          </div>
        </div>
      </div>

      {/* List / Table Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E7E5DF] text-center text-sm text-[#6C727E] shadow-sm">
          <div className="animate-spin w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full mx-auto mb-3" />
          Memuat data arsip Biro PBMN...
        </div>
      ) : archives.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E7E5DF] text-center text-sm text-[#6C727E] shadow-sm">
          🔍 Tidak ada berkas arsip yang cocok dengan pencarian kata kunci atau filter yang dipilih.
        </div>
      ) : (
        <>
          {/* Mobile Card List View (Visible on Small Screens) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {archives.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="bg-white rounded-2xl p-4 border border-[#E7E5DF] shadow-sm hover:border-[#F59E0B]/60 transition active:scale-[0.99] cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    {item.kode}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.skkaad === "Terbuka"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.skkaad}
                    </span>
                    <span className="whitespace-nowrap px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#F5F4EE] text-[#4A505C] border border-[#E7E5DF]">
                      {item.box}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#2D323A] line-clamp-2 leading-snug">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-[#6C727E] line-clamp-2 mt-1">
                    {item.uraian}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0EFEA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#6C727E]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tahun {item.tahun}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#6C727E]">Masa Retensi:</span>
                    <span className="font-mono font-bold text-[#2D323A] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E7E5DF]">
                      {item.jra?.tahunHabisRetensi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Visible on Medium and Large Screens) */}
          <div className="hidden md:block bg-white rounded-3xl border border-[#E7E5DF] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F4EE] border-b border-[#E7E5DF] text-[#4A505C] font-semibold uppercase">
                    <th className="p-3.5 w-16 text-center">Berkas</th>
                    <th className="p-3.5 w-24">Kode</th>
                    <th className="p-3.5 w-60">Indeks / Judul</th>
                    <th className="p-3.5 min-w-[280px]">Uraian Masalah / Kegiatan</th>
                    <th className="p-3.5 w-16 text-center">Tahun</th>
                    <th className="p-3.5 min-w-[6rem] text-center whitespace-nowrap">Boks</th>
                    <th className="p-3.5 min-w-[7rem] text-center whitespace-nowrap">Masa Retensi</th>
                    <th className="p-3.5 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {archives.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF9F5] transition">
                      <td className="p-3.5 text-center font-bold text-[#9CA3AF]">
                        {item.no_berkas}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#2563EB]">
                        {item.kode}
                      </td>
                      <td 
                        onClick={() => openDetail(item)}
                        className="p-3.5 font-bold text-[#2D323A] cursor-pointer hover:text-[#3B82F6] hover:underline"
                      >
                        {item.judul}
                      </td>
                      <td className="p-3.5 text-[#6C727E] line-clamp-2 max-w-md">
                        {item.uraian}
                      </td>
                      <td className="p-3.5 text-center font-semibold text-[#2D323A]">
                        {item.tahun}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded bg-[#F5F4EE] border border-[#E7E5DF] font-bold text-[#4A505C] text-xs">
                          {item.box}
                        </span>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-[#2D323A] px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E7E5DF] inline-block">
                          {item.jra?.tahunHabisRetensi}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => openDetail(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-white border border-[#E7E5DF] text-[#2D323A] font-semibold text-[11px] shadow-sm transition"
                        >
                          Detail ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PrimeReact Dialog Detail Berkas */}
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
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
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
                <span className="text-[10px] text-[#6C727E] block">Nomor Berkas / Urut</span>
                <span className="font-bold text-[#2D323A] text-xs">
                  {selectedArchive.no_berkas} / {selectedArchive.no_urut}
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Tahun / Volume</span>
                <span className="font-bold text-[#2D323A] text-xs">
                  {selectedArchive.tahun} ({selectedArchive.jumlah})
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Kondisi Fisik</span>
                <span className="font-bold text-[#2D323A] text-xs">
                  {selectedArchive.status_fisik}
                </span>
              </div>
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DF]">
                <span className="text-[10px] text-[#6C727E] block">Keamanan (SKKAAD)</span>
                <span className={`font-bold text-xs ${selectedArchive.skkaad === "Terbuka" ? "text-emerald-700" : "text-amber-700"}`}>
                  {selectedArchive.skkaad}
                </span>
              </div>
            </div>

            {/* Evaluasi JRA Permen PUPR 26/2021 */}
            <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/40 border border-[#FDE68A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Jadwal Retensi Arsip (Permen PUPR No. 26/2021)
                </span>
                <Tag
                  value={selectedArchive.jra?.badgeLabel}
                  severity={selectedArchive.jra?.badgeSeverity}
                  className="text-[10px] font-bold"
                />
              </div>
              <p className="text-[11px] text-[#78350F] leading-relaxed">
                {selectedArchive.jra?.catatanRetensi}. Masa aktif {selectedArchive.jra?.retensiAktifTahun} tahun & masa inaktif {selectedArchive.jra?.retensiInaktifTahun} tahun (Batas simpan: {selectedArchive.jra?.tahunHabisRetensi}).
              </p>
            </div>

            {/* Lokasi Simpan Fisik & File Digital */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#1D4ED8] font-bold block uppercase tracking-wide">
                  📍 Lokasi Simpan Fisik
                </span>
                <div className="font-bold text-[#1E3A8A] text-xs mt-0.5">
                  {selectedArchive.box} &bull; {selectedArchive.lokasi}
                </div>
              </div>

              {selectedArchive.file_url ? (
                <a
                  href={selectedArchive.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Buka Scan PDF
                </a>
              ) : selectedArchive.skkaad === "Terbuka" ? (
                <span className="text-[11px] text-[#6C727E] italic">
                  Scan digital belum diunggah
                </span>
              ) : (
                <span className="text-[11px] text-amber-800 font-medium">
                  🔒 Dokumen Terbatas (Akses fisik)
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                label="Tutup"
                onClick={() => setDialogVisible(false)}
                className="p-button-secondary p-button-sm text-xs"
              />
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
