"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Box, MapPin, Search, ArrowLeft, Archive, CheckCircle2, AlertTriangle, LogIn } from "lucide-react";

export default function StorageMapPage() {
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [selectedBox, setSelectedBox] = useState<string>("BOX 1");
  const [boxArchives, setBoxArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Default state: pengguna publik
    const saved = localStorage.getItem("arsip_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    fetchBoxStats();
  }, []);

  const fetchBoxStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.success) {
        setBoxes(json.stats.boxCounts || {});
        loadBoxDetail("BOX 1");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBoxDetail = async (boxName: string) => {
    setSelectedBox(boxName);
    try {
      const res = await fetch(`/api/archives?box=${encodeURIComponent(boxName)}`);
      const json = await res.json();
      if (json.success) {
        setBoxArchives(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Proteksi Pengguna Publik: Hanya ada jika melakukan login
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-[#E7E5DF] shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-xl">
            📦
          </div>
          <h2 className="text-lg font-bold text-[#2D323A]">Akses Peta Boks Fisik</h2>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Halaman visualisasi boks dan denah penyimpanan fisik hanya dapat diakses oleh petugas yang telah melakukan login.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2D323A] hover:bg-black text-white text-xs font-bold shadow-sm transition"
            >
              <LogIn className="w-4 h-4 text-[#F59E0B]" />
              Masuk / Login Petugas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
            Peta Lokasi & <span className="text-[#3B82F6]">Boks Fisik</span>
          </h1>
          <p className="text-xs text-[#6C727E] mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            Ruang Kerja Bagian PMH BMN, Lt.4 Gedung Menteri PU, Jl. Pattimura No. 20
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E7E5DF] text-[#2D323A] text-xs font-semibold shadow-sm hover:bg-[#FAF9F5] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Katalog
        </Link>
      </div>

      {/* Visual Boks Grid (Mobile-First responsive) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D323A] uppercase tracking-wide">
            Pilih Boks untuk Menampilkan Daftar Naskah di Dalamnya:
          </span>
          <span className="text-[11px] text-[#6C727E]">{Object.keys(boxes).length} Boks Terdata</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(boxes).map(([boxName, count]) => {
            const isSelected = selectedBox === boxName;
            return (
              <div
                key={boxName}
                onClick={() => loadBoxDetail(boxName)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                  isSelected
                    ? "bg-[#FEF3C7]/40 border-[#F59E0B] shadow-sm ring-2 ring-[#F59E0B]/20"
                    : "bg-[#FAF9F5] border-[#E7E5DF] hover:bg-white hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-mono font-bold text-xs whitespace-nowrap ${isSelected ? "text-[#B45309]" : "text-[#2D323A]"}`}>
                    📦 {boxName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white border border-[#E7E5DF] text-[#4A505C] shrink-0">
                    {count}
                  </span>
                </div>
                <div className="text-[11px] text-[#6C727E] truncate">
                  Lt.4 Gedung Menteri
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daftar Arsip di dalam Boks Terpilih */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#2D323A]">
              Isi Dokumen di dalam: <span className="text-[#3B82F6]">{selectedBox}</span>
            </h2>
            <p className="text-xs text-[#6C727E]">
              Memuat {boxArchives.length} naskah berkas fisik.
            </p>
          </div>
        </div>

        {boxArchives.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6C727E]">
            Tidak ada data naskah di dalam boks ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold uppercase">
                  <th className="p-3 w-16 text-center">No Berkas</th>
                  <th className="p-3 w-24">Kode</th>
                  <th className="p-3 w-64">Indeks / Judul</th>
                  <th className="p-3 min-w-[260px]">Uraian Masalah / Kegiatan</th>
                  <th className="p-3 w-16 text-center">Tahun</th>
                  <th className="p-3 w-28 text-center whitespace-nowrap">SKKAAD</th>
                  <th className="p-3 min-w-[7rem] text-center whitespace-nowrap">Masa Retensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {boxArchives.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F5] transition">
                    <td className="p-3 text-center font-bold text-[#9CA3AF]">
                      {item.no_berkas}
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
                    <td className="p-3 text-center font-medium">
                      {item.tahun}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.skkaad === "Terbuka"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {item.skkaad}
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
        )}
      </div>

    </div>
  );
}
