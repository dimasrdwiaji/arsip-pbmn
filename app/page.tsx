"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Eye, 
  Download,
  Calendar, 
  Building2,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import { Dialog } from "primereact/dialog";

export default function PublicCatalogPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("ALL");
  const [selectedKode, setSelectedKode] = useState("ALL");
  const [selectedBox, setSelectedBox] = useState("ALL");
  const [selectedJra, setSelectedJra] = useState("ALL");
  const [selectedPencipta, setSelectedPencipta] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // Pilihan 2 saja: AKTIF dan INAKTIF

  // Sorting State
  const [sortField, setSortField] = useState<string>("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Detail Modal State
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
      } else if (sortField === "status_jra") {
        valA = a.jra?.statusJra || "";
        valB = b.jra?.statusJra || "";
      } else if (sortField === "no_berkas") {
        valA = parseInt(String(a.no_berkas || "").replace(/\D+/g, "") || "0", 10);
        valB = parseInt(String(b.no_berkas || "").replace(/\D+/g, "") || "0", 10);
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

  return (
    <div className="space-y-5">

      {/* Header Banner Minimalis Japandi */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E7E5DF] shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2D323A]">
              Katalog Arsip <span className="text-[#3B82F6]">Biro PBMN</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5F4EE] text-[#4A505C] border border-[#E7E5DF]">
              Permen PUPR No. 26/2021
            </span>
          </div>
          <p className="text-xs text-[#6C727E] mt-1">
            Penelusuran arsip aktif dan inaktif Bagian PMH BMN dengan masa retensi terstandarisasi.
          </p>
        </div>

        {/* 1. KOTAK PENCARIAN (SEARCH BOX) */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor berkas, uraian informasi, surat, sertifikat, atau nama pihak..."
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
                <option value="DALAM_RETENSI">Dalam Simpan</option>
              </select>
            </div>

            {/* Filter 5: Pencipta */}
            <div>
              <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">
                Pencipta Arsip
              </label>
              <select
                value={selectedPencipta}
                onChange={(e) => setSelectedPencipta(e.target.value)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs font-medium text-[#2D323A] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="ALL">Semua Pencipta</option>
                <option value="INTERNAL">Internal PUPR</option>
                <option value="EKSTERNAL">Eksternal (Luar)</option>
              </select>
            </div>

            {/* Filter 6: Status Siklus (Pilihan 2 saja: Aktif dan Inaktif) */}
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

      {/* Tabel Data Arsip Minimalis */}
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
                      ({item.tahun})
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
                  <span className="text-[#6C727E] truncate max-w-[180px]">
                    {item.pencipta || "Internal PUPR"}
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

          {/* Desktop Table View dengan Sortir Kolom & Kolom Tahun Terpisah */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E7E5DF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase tracking-wider">
                    <th 
                      onClick={() => handleSort("no_berkas")} 
                      className="p-3 w-14 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      No {renderSortIndicator("no_berkas")}
                    </th>
                    <th 
                      onClick={() => handleSort("box")} 
                      className="p-3 w-24 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Boks {renderSortIndicator("box")}
                    </th>
                    <th 
                      onClick={() => handleSort("kode")} 
                      className="p-3 w-28 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Kode {renderSortIndicator("kode")}
                    </th>
                    <th 
                      onClick={() => handleSort("tahun")} 
                      className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Tahun {renderSortIndicator("tahun")}
                    </th>
                    <th 
                      onClick={() => handleSort("judul")} 
                      className="p-3 min-w-[260px] cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Uraian Masalah / Judul Berkas {renderSortIndicator("judul")}
                    </th>
                    <th 
                      onClick={() => handleSort("pencipta")} 
                      className="p-3 w-36 cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Pencipta {renderSortIndicator("pencipta")}
                    </th>
                    <th 
                      onClick={() => handleSort("jenis_arsip")} 
                      className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Status {renderSortIndicator("jenis_arsip")}
                    </th>
                    <th 
                      onClick={() => handleSort("masa_retensi")} 
                      className="p-3 w-28 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Masa Retensi {renderSortIndicator("masa_retensi")}
                    </th>
                    <th 
                      onClick={() => handleSort("status_jra")} 
                      className="p-3 w-32 text-center cursor-pointer select-none hover:text-[#2D323A]"
                    >
                      Ket. JRA {renderSortIndicator("status_jra")}
                    </th>
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
                      <td className="p-3 text-center text-[#9CA3AF] font-medium">
                        {item.no_berkas}
                      </td>
                      <td className="p-3 font-semibold text-[#2D323A] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#F5F4EE] border border-[#E7E5DF] text-[11px] font-mono">
                          {item.box}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                        {item.kode}
                      </td>
                      <td className="p-3 text-center font-semibold text-[#2D323A] whitespace-nowrap">
                        {item.tahun}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#2D323A] line-clamp-1">
                          {item.judul}
                        </div>
                        <div className="text-[#6C727E] text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                          {item.uraian}
                        </div>
                      </td>
                      <td className="p-3 text-[11px]">
                        <div className="font-medium text-[#2D323A] truncate max-w-[140px]">
                          {item.pencipta || "Internal PUPR"}
                        </div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold mt-0.5 ${
                          item.kategori_pencipta === "EKSTERNAL" 
                            ? "bg-amber-50 text-amber-800 border border-amber-200" 
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.kategori_pencipta === "EKSTERNAL" ? "Eksternal" : "Internal"}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.jenis_arsip === "AKTIF"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}>
                          {item.jenis_arsip}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-mono font-bold text-[#2D323A]">
                        {item.jra?.tahunHabisRetensi}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.jra?.statusJra === "SIAP_MUSNAH"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.jra?.statusJra === "USUL_PERMANEN"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {item.jra?.badgeLabel || "Dalam Simpan"}
                        </span>
                      </td>
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

      {/* Dialog Detail Berkas (On Click Row & Tombol Lihat) */}
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
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="w-[95vw] sm:w-[620px]"
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
              <span className="text-[11px] text-[#6C727E] font-medium block">Uraian Masalah / Perihal Naskah:</span>
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] mt-1 leading-relaxed text-xs">
                {selectedArchive.uraian}
              </div>
            </div>

            {/* Grid Informasi Kearsipan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF]">
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Nomor Boks</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.box}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Tahun Dokumen</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.tahun}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Status Siklus</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.jenis_arsip}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Kondisi Fisik</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.status_fisik}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Akses Keamanan</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.skkaad}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Masa Retensi</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.jra?.tahunHabisRetensi}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Pencipta Arsip</span>
                <span className="font-semibold text-[#2D323A]">
                  {selectedArchive.pencipta || "Internal PUPR"} ({selectedArchive.kategori_pencipta || "INTERNAL"})
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Lokasi Simpan</span>
                <span className="text-[#4A505C]">{selectedArchive.lokasi}</span>
              </div>
            </div>

            {/* Rekomendasi JRA */}
            <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
              <span className="font-bold text-[#1E40AF] block text-xs">
                Evaluasi JRA (Permen PUPR No. 26 Tahun 2021):
              </span>
              <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
                Dasar Hukum: {selectedArchive.jra?.dasarHukum}. {selectedArchive.jra?.catatanRetensi}. Rekomendasi Nasib Akhir: <strong>{selectedArchive.jra?.nasibAkhir}</strong>.
              </p>
            </div>

            {/* Dokumen PDF Scan (Jika Ada) */}
            {selectedArchive.file_url ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E5DF]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-semibold text-[#2D323A]">Dokumen PDF Digital Tersedia</span>
                </div>
                <a
                  href={selectedArchive.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-semibold text-xs hover:bg-[#1D4ED8] transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Dokumen
                </a>
              </div>
            ) : (
              <div className="text-[11px] text-[#9CA3AF] italic text-center py-1">
                Belum ada berkas scan PDF digital yang diunggah untuk arsip ini.
              </div>
            )}
          </div>
        )}
      </Dialog>

    </div>
  );
}
