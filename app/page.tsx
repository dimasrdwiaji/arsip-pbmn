"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Eye, 
  ExternalLink,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X,
  FileText,
  Shield,
  BookOpen,
  FolderArchive,
  Info
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import { normalizeBox } from "@/lib/jra";
import { translateClassificationCode, CodeTranslation } from "@/lib/classification";

export default function PublicCatalogPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("ALL");
  const [selectedKode, setSelectedKode] = useState("ALL");
  const [selectedBox, setSelectedBox] = useState("ALL");
  const [selectedJra, setSelectedJra] = useState("ALL");
  const [selectedPencipta, setSelectedPencipta] = useState("ALL"); // ALL, Biro PBMN, Kementerian PU, Eksternal
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL, AKTIF, INAKTIF

  // Sorting State
  const [sortField, setSortField] = useState<string>("no_berkas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Detail & Code Translation Modal State
  const [selectedArchive, setSelectedArchive] = useState<any | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Dynamic filter options
  const [tahunOptions, setTahunOptions] = useState<number[]>([]);
  const [kodeOptions, setKodeOptions] = useState<string[]>([]);
  const [boxOptions, setBoxOptions] = useState<string[]>([]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedTahun !== "ALL") params.set("tahun", selectedTahun);
      if (selectedKode !== "ALL") params.set("kode", selectedKode);
      if (selectedBox !== "ALL") params.set("box", selectedBox);
      if (selectedJra !== "ALL") params.set("jra", selectedJra);
      if (selectedPencipta !== "ALL") params.set("kategori_pencipta", selectedPencipta);
      if (selectedStatus !== "ALL") params.set("jenis_arsip", selectedStatus);

      const res = await fetch(`/api/archives?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setArchives(json.data);

        // Kumpulkan opsi filter dinamis dari data
        if (tahunOptions.length === 0) {
          const years = Array.from(new Set(json.data.map((d: any) => d.tahun).filter(Boolean))) as number[];
          years.sort((a, b) => b - a);
          setTahunOptions(years);
        }

        if (kodeOptions.length === 0) {
          const kodes = Array.from(new Set(json.data.map((d: any) => d.kode).filter(Boolean))) as string[];
          kodes.sort();
          setKodeOptions(kodes);
        }

        if (boxOptions.length === 0) {
          const boxes = Array.from(new Set(json.data.map((d: any) => d.box).filter(Boolean))) as string[];
          boxes.sort((a, b) => {
            const numA = parseInt(String(a).replace(/\D+/g, "") || "0", 10);
            const numB = parseInt(String(b).replace(/\D+/g, "") || "0", 10);
            return numA - numB;
          });
          setBoxOptions(boxes);
        }
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
  }, [searchQuery, selectedTahun, selectedKode, selectedBox, selectedJra, selectedPencipta, selectedStatus]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedArchives = useMemo(() => {
    return [...archives].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "box") {
        valA = parseInt(String(a.box || "").replace(/\D+/g, "") || "0", 10);
        valB = parseInt(String(b.box || "").replace(/\D+/g, "") || "0", 10);
      } else if (sortField === "masa_retensi") {
        valA = a.jra?.tahunHabisRetensi || 0;
        valB = b.jra?.tahunHabisRetensi || 0;
      } else if (sortField === "no_berkas") {
        valA = parseInt(String(a.no_berkas || "").replace(/\D+/g, "") || "0", 10);
        valB = parseInt(String(b.no_berkas || "").replace(/\D+/g, "") || "0", 10);
      } else if (sortField === "no_urut") {
        valA = parseInt(String(a.no_urut || "").replace(/\D+/g, "") || "0", 10);
        valB = parseInt(String(b.no_urut || "").replace(/\D+/g, "") || "0", 10);
      } else if (typeof valA === "string") {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [archives, sortField, sortOrder]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedTahun("ALL");
    setSelectedKode("ALL");
    setSelectedBox("ALL");
    setSelectedJra("ALL");
    setSelectedPencipta("ALL");
    setSelectedStatus("ALL");
  };

  const openDetail = (item: any) => {
    setSelectedArchive(item);
    setDialogVisible(true);
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#9CA3AF] opacity-40 inline-block ml-1" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#2563EB] inline-block ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#2563EB] inline-block ml-1" />
    );
  };

  // Evaluasi translasi kode saat modal terbuka
  const translationInfo: CodeTranslation | null = useMemo(() => {
    if (!selectedArchive) return null;
    return translateClassificationCode(
      selectedArchive.kode,
      selectedArchive.tahun,
      selectedArchive.uraian,
      selectedArchive.judul,
      selectedArchive.skkaad,
      selectedArchive.jenis_arsip
    );
  }, [selectedArchive]);

  return (
    <div className="space-y-5">

      {/* Header Banner Minimalis Japandi */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7E5DF] shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2D323A]">
              Katalog Arsip <span className="text-[#3B82F6]">Biro PBMN</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              Permen PU No. 15/2026 &bull; Permen PUPR No. 26/2021
            </span>
          </div>
          <p className="text-xs text-[#6C727E] mt-1">
            Penelusuran arsip aktif dan inaktif Bagian PMH BMN dengan translasi kodefikasi resmi dan tata kelola terintegrasi.
          </p>
        </div>

        {/* 1. KOTAK PENCARIAN (SEARCH BOX) */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor berkas, perihal uraian masalah, judul naskah, kode klasifikasi, atau pencipta..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-xs sm:text-sm text-[#2D323A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#2D323A] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. SEMUA FILTER DALAM SATU BARIS (DI BAWAH SEARCH BOX) */}
        <div className="pt-2 border-t border-[#F0EFEA] space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            
            {/* Filter 1: Tahun Pembuatan */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Tahun Pembuatan
              </label>
              <select
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Tahun</option>
                {tahunOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Kode Klasifikasi */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Kode Klasifikasi
              </label>
              <select
                value={selectedKode}
                onChange={(e) => setSelectedKode(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Kode</option>
                {kodeOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Boks (Seragam: Box 1, Box 2, dst) */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Nomor Boks
              </label>
              <select
                value={selectedBox}
                onChange={(e) => setSelectedBox(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Boks</option>
                {boxOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: Jadwal Retensi */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Jadwal Retensi
              </label>
              <select
                value={selectedJra}
                onChange={(e) => setSelectedJra(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Retensi</option>
                <option value="SIAP_MUSNAH">Siap Dimusnahkan</option>
                <option value="USUL_PERMANEN">Usul Permanen</option>
                <option value="DALAM_RETENSI">Dalam Masa Simpan</option>
              </select>
            </div>

            {/* Filter 5: Pencipta Arsip (3 Kategori) */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Pencipta Arsip
              </label>
              <select
                value={selectedPencipta}
                onChange={(e) => setSelectedPencipta(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Pencipta (3 Tier)</option>
                <option value="Biro PBMN">Biro PBMN</option>
                <option value="Kementerian PU">Kementerian PU</option>
                <option value="Eksternal">Eksternal</option>
              </select>
            </div>

            {/* Filter 6: Status Siklus (Aktif & Inaktif) */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Status Siklus
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="INAKTIF">Inaktif</option>
              </select>
            </div>

          </div>

          {/* Baris Status & Tombol Reset */}
          <div className="flex items-center justify-between text-xs pt-1.5 text-[#6C727E]">
            <span>
              Menampilkan <strong className="text-[#2D323A] font-bold">{sortedArchives.length}</strong> naskah berkas
            </span>
            {(searchQuery || selectedTahun !== "ALL" || selectedKode !== "ALL" || selectedBox !== "ALL" || selectedJra !== "ALL" || selectedPencipta !== "ALL" || selectedStatus !== "ALL") && (
              <button
                onClick={resetAllFilters}
                className="text-[#2563EB] hover:underline font-semibold text-xs transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Tabel Data Arsip Penyelarasan Kolom Sesuai Excel Asli */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
          <div className="animate-spin w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-2" />
          Memuat data arsip...
        </div>
      ) : sortedArchives.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
          Tidak ada berkas yang sesuai dengan kriteria pencarian dan filter Anda.
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {sortedArchives.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="bg-white rounded-xl p-3.5 border border-[#E7E5DF] shadow-xs active:bg-[#FAF9F5] transition cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">
                      {item.kode}
                    </span>
                    <span className="text-[11px] text-[#6C727E]">
                      (Tahun {item.tahun})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F4EE] text-[#4A505C]">
                      {item.box}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.jenis_arsip === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {item.jenis_arsip}
                    </span>
                  </div>
                </div>

                <div className="font-bold text-xs text-[#2D323A] line-clamp-2">
                  {item.judul}
                </div>
                <div className="text-[11px] text-[#6C727E] line-clamp-2">
                  {item.uraian}
                </div>

                <div className="pt-2 border-t border-[#F0EFEA] flex items-center justify-between text-[11px]">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    item.kategori_pencipta_3 === "Biro PBMN"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : item.kategori_pencipta_3 === "Kementerian PU"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}>
                    {item.kategori_pencipta_3 || "Biro PBMN"}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-[#2D323A]">
                    <span>Masa Retensi:</span>
                    <span className="font-mono bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#E7E5DF]">
                      {item.jra?.tahunHabisRetensi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View - Urutan Kolom Sesuai Excel Asli */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E7E5DF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase tracking-wider">
                    {/* 1. No Berkas */}
                    <th 
                      onClick={() => handleSort("no_berkas")} 
                      className="p-3 w-16 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      No Berkas {renderSortIndicator("no_berkas")}
                    </th>
                    {/* 2. No Urut */}
                    <th 
                      onClick={() => handleSort("no_urut")} 
                      className="p-3 w-14 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      No Urut {renderSortIndicator("no_urut")}
                    </th>
                    {/* 3. Kode */}
                    <th 
                      onClick={() => handleSort("kode")} 
                      className="p-3 w-24 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Kode {renderSortIndicator("kode")}
                    </th>
                    {/* 4. Indeks / Judul */}
                    <th 
                      onClick={() => handleSort("judul")} 
                      className="p-3 min-w-[220px] cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Indeks / Judul Berkas {renderSortIndicator("judul")}
                    </th>
                    {/* 5. Uraian Masalah / Kegiatan */}
                    <th 
                      onClick={() => handleSort("uraian")} 
                      className="p-3 min-w-[240px] cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Uraian Masalah / Kegiatan {renderSortIndicator("uraian")}
                    </th>
                    {/* 6. Tahun */}
                    <th 
                      onClick={() => handleSort("tahun")} 
                      className="p-3 w-16 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Tahun {renderSortIndicator("tahun")}
                    </th>
                    {/* 7. Jumlah */}
                    <th className="p-3 w-18 text-center">
                      Jumlah
                    </th>
                    {/* 8. Asli / Copy */}
                    <th className="p-3 w-16 text-center">
                      Fisik
                    </th>
                    {/* 9. Boks */}
                    <th 
                      onClick={() => handleSort("box")} 
                      className="p-3 w-20 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Boks {renderSortIndicator("box")}
                    </th>
                    {/* 10. SKKAAD */}
                    <th 
                      onClick={() => handleSort("skkaad")} 
                      className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      SKKAAD {renderSortIndicator("skkaad")}
                    </th>
                    {/* 11. Lokasi Simpan */}
                    <th className="p-3 w-28">
                      Lokasi
                    </th>
                    {/* 12. Pencipta */}
                    <th 
                      onClick={() => handleSort("kategori_pencipta_3")} 
                      className="p-3 w-32 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Pencipta {renderSortIndicator("kategori_pencipta_3")}
                    </th>
                    {/* 13. Masa Retensi */}
                    <th 
                      onClick={() => handleSort("masa_retensi")} 
                      className="p-3 w-24 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Masa Retensi {renderSortIndicator("masa_retensi")}
                    </th>
                    {/* 14. Dokumen Online */}
                    <th className="p-3 w-24 text-center">
                      Dokumen Online
                    </th>
                    {/* 15. Aksi */}
                    <th className="p-3 w-16 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {sortedArchives.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openDetail(item)}
                      className="hover:bg-[#FAF9F5] transition cursor-pointer"
                    >
                      {/* 1. No Berkas */}
                      <td className="p-3 text-center text-[#9CA3AF] font-medium font-mono">
                        {item.no_berkas}
                      </td>
                      {/* 2. No Urut */}
                      <td className="p-3 text-center text-[#9CA3AF] font-medium font-mono">
                        {item.no_urut}
                      </td>
                      {/* 3. Kode */}
                      <td className="p-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                        {item.kode}
                      </td>
                      {/* 4. Indeks / Judul Berkas (Clickable text) */}
                      <td className="p-3 font-bold text-[#2D323A] hover:text-[#2563EB] transition">
                        <span className="line-clamp-2" title="Klik untuk melihat translasi kodefikasi">
                          {item.judul}
                        </span>
                      </td>
                      {/* 5. Uraian Masalah / Kegiatan */}
                      <td className="p-3 text-[#6C727E] text-[11px] leading-relaxed">
                        <span className="line-clamp-2">
                          {item.uraian}
                        </span>
                      </td>
                      {/* 6. Tahun */}
                      <td className="p-3 text-center font-semibold text-[#2D323A] whitespace-nowrap">
                        {item.tahun}
                      </td>
                      {/* 7. Jumlah */}
                      <td className="p-3 text-center text-[#6C727E] whitespace-nowrap">
                        {item.jumlah || "1 berkas"}
                      </td>
                      {/* 8. Asli / Copy */}
                      <td className="p-3 text-center whitespace-nowrap font-medium text-[11px] text-[#4A505C]">
                        {item.status_fisik || "ASLI"}
                      </td>
                      {/* 9. Boks */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#F5F4EE] border border-[#E7E5DF] text-[11px] font-mono font-semibold text-[#2D323A]">
                          {item.box}
                        </span>
                      </td>
                      {/* 10. SKKAAD */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.skkaad === "Terbatas"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : item.skkaad === "Rahasia"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {item.skkaad || "Terbuka"}
                        </span>
                      </td>
                      {/* 11. Lokasi Simpan */}
                      <td className="p-3 text-[#6C727E] text-[11px] truncate max-w-[120px]" title={item.lokasi}>
                        {item.lokasi || "Gedung Menteri PU Lt.4"}
                      </td>
                      {/* 12. Pencipta (3 Kategori) */}
                      <td className="p-3 text-[11px]">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-0.5 ${
                          item.kategori_pencipta_3 === "Biro PBMN"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.kategori_pencipta_3 === "Kementerian PU"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {item.kategori_pencipta_3 || "Biro PBMN"}
                        </span>
                        <div className="text-[10px] text-[#6C727E] truncate max-w-[130px]" title={item.pencipta}>
                          {item.pencipta || "Biro Pengelolaan BMN"}
                        </div>
                      </td>
                      {/* 13. Masa Retensi */}
                      <td className="p-3 text-center whitespace-nowrap font-mono font-bold text-[#2D323A]">
                        {item.jra?.tahunHabisRetensi}
                      </td>
                      {/* 14. Dokumen Online */}
                      <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {item.file_url ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] border border-[#BFDBFE] font-medium text-[10px] transition"
                            title="Buka dokumen online di tab baru"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Buka Link
                          </a>
                        ) : (
                          <span className="text-[#9CA3AF] text-[11px]">-</span>
                        )}
                      </td>
                      {/* 15. Aksi */}
                      <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openDetail(item)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] font-semibold text-[11px] shadow-2xs transition"
                        >
                          Lihat
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

      {/* Dialog Detail & Translasi Kodefikasi Kearsipan Resmi */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              {selectedArchive?.kode}
            </span>
            <span className="text-sm font-bold text-[#2D323A]">
              Detail & Translasi Kodefikasi Berkas #{selectedArchive?.no_berkas} ({selectedArchive?.tahun})
            </span>
          </div>
        }
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="w-[95vw] sm:w-[720px]"
        breakpoints={{ "960px": "80vw", "641px": "95vw" }}
      >
        {selectedArchive && translationInfo && (
          <div className="space-y-4 text-xs pt-1 max-h-[75vh] overflow-y-auto pr-1">
            
            {/* Bagian 1: Indeks / Judul & Uraian Masalah */}
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-[#6C727E] font-medium block">Indeks / Judul Berkas:</span>
                <h2 className="text-sm sm:text-base font-bold text-[#2D323A] mt-0.5">
                  {selectedArchive.judul}
                </h2>
              </div>

              <div>
                <span className="text-[11px] text-[#6C727E] font-medium block">Uraian Masalah / Kegiatan:</span>
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] mt-1 leading-relaxed text-xs">
                  {selectedArchive.uraian}
                </div>
              </div>
            </div>

            {/* Bagian 2: Kartu Translasi Kode Klasifikasi Resmi Sesuai Periode Regulasi */}
            <div className="p-3.5 rounded-xl bg-white border border-[#BFDBFE] space-y-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2 border-b border-[#EFF6FF] pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-bold text-xs text-[#1E40AF]">
                    Translasi Kodefikasi: {translationInfo.kode}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  {translationInfo.periodeRegulasi === "PRE_OCT_2018" ? "Sebelum Okt 2018" : "Setelah Okt 2018"}
                </span>
              </div>

              <div className="text-[11px] text-[#4A505C] bg-[#FAF9F5] p-2 rounded-lg border border-[#E7E5DF]">
                <strong className="text-[#2D323A]">Dasar Regulasi:</strong> {translationInfo.namaRegulasi}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Fungsi</span>
                  <span className="font-semibold text-[#2D323A]">{translationInfo.fungsi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Pokok Masalah Utama</span>
                  <span className="font-semibold text-[#2D323A]">{translationInfo.pokokMasalah}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Sub-Masalah</span>
                  <span className="font-semibold text-[#2D323A]">{translationInfo.subMasalah}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Rincian Klasifikasi</span>
                  <span className="font-medium text-[#2D323A]">{translationInfo.rincian}</span>
                </div>
              </div>
            </div>

            {/* Bagian 3: Identitas Kearsipan Fisik & Lokasi Simpan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">No Berkas / No Urut</span>
                <span className="font-bold text-[#2D323A]">Berkas {selectedArchive.no_berkas} &bull; Urut {selectedArchive.no_urut}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Nomor Boks</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.box}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Tahun Dokumen</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.tahun}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Jumlah & Kondisi</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.jumlah || "1 berkas"} ({selectedArchive.status_fisik || "ASLI"})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Status Siklus</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.jenis_arsip}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Masa Retensi (JRA)</span>
                <span className="font-bold text-[#2D323A]">s.d. Tahun {selectedArchive.jra?.tahunHabisRetensi}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Pencipta Arsip</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    selectedArchive.kategori_pencipta_3 === "Biro PBMN"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : selectedArchive.kategori_pencipta_3 === "Kementerian PU"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}>
                    {selectedArchive.kategori_pencipta_3 || "Biro PBMN"}
                  </span>
                  <span className="font-medium text-[#2D323A]">
                    {selectedArchive.pencipta || "Biro Pengelolaan BMN"}
                  </span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Lokasi Simpan Fisik</span>
                <span className="text-[#4A505C]">{selectedArchive.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN"}</span>
              </div>
            </div>

            {/* Bagian 4: SKKAAD & Penyelenggaraan Arsip Dinamis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SKKAAD Permen 27/2021 */}
              <div className="p-3 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#B45309] font-bold text-xs">
                  <Shield className="w-4 h-4 text-[#D97706]" />
                  <span>SKKAAD (Permen PUPR No. 27/2021)</span>
                </div>
                <div className="text-[11px] text-[#92400E] space-y-0.5 leading-relaxed">
                  <div><strong>Tingkat Keamanan:</strong> {translationInfo.skkaadInfo.kategori}</div>
                  <div><strong>Hak Akses:</strong> {translationInfo.skkaadInfo.hakAkses}</div>
                  <div className="text-[10px] text-[#78350F]">{translationInfo.skkaadInfo.keterangan}</div>
                </div>
              </div>

              {/* Penyelenggaraan Arsip Dinamis Permen 15/2026 */}
              <div className="p-3 rounded-xl bg-[#F5F4EE] border border-[#E7E5DF] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#2D323A] font-bold text-xs">
                  <FolderArchive className="w-4 h-4 text-[#4A505C]" />
                  <span>Penyelenggaraan (Permen PU No. 15/2026)</span>
                </div>
                <div className="text-[11px] text-[#4A505C] space-y-0.5 leading-relaxed">
                  <div><strong>Tahap Siklus:</strong> {translationInfo.penyelenggaraanInfo.tahapSiklus}</div>
                  <div><strong>Unit Penanggung Jawab:</strong> {translationInfo.penyelenggaraanInfo.unitPenanggungJawab}</div>
                  <div className="text-[10px] text-[#6C727E]">{translationInfo.penyelenggaraanInfo.prosedurPengelolaan}</div>
                </div>
              </div>
            </div>

            {/* Bagian 5: Dokumen Online Link */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[#2D323A] block">Dokumen Berkas Online</span>
                <span className="text-[11px] text-[#6C727E]">
                  {selectedArchive.file_url 
                    ? "Tautan dokumen digital online (Google Drive / Cloud Storage) tersedia untuk diakses."
                    : "Belum ada link dokumen online yang dilampirkan untuk berkas ini."}
                </span>
              </div>
              {selectedArchive.file_url && (
                <a
                  href={selectedArchive.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Dokumen Online ↗
                </a>
              )}
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
}
