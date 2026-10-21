"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Box, MapPin, ArrowLeft, LogIn } from "lucide-react";
import { normalizeBox } from "@/lib/jra";

export default function StorageMapPage() {
  const [boxes, setBoxes] = useState<Record<string, number>>({});
  const [selectedBox, setSelectedBox] = useState<string>("Box 1");
  const [boxArchives, setBoxArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
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
        loadBoxDetail("Box 1");
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border border-[#E7E5DF] shadow-xs max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <Box className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2D323A]">Akses Peta Boks Fisik</h2>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Halaman visualisasi boks dan denah penyimpanan fisik hanya dapat diakses oleh petugas yang telah melakukan login.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D323A] hover:bg-black text-white text-xs font-bold shadow-xs transition"
            >
              <LogIn className="w-4 h-4 text-[#F59E0B]" />
              Masuk / Login Petugas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Urutkan boks secara numerik (Box 1, Box 2, Box 3 ... Box 28)
  const sortedBoxKeys = Object.keys(boxes).sort((a, b) => {
    const numA = parseInt(a.replace(/\D+/g, "") || "0", 10);
    const numB = parseInt(b.replace(/\D+/g, "") || "0", 10);
    return numA - numB;
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
            Peta Lokasi & <span className="text-[#3B82F6]">Boks Fisik</span>
          </h1>
          <p className="text-xs text-[#6C727E] mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
            Ruang Kerja Bagian PMH BMN, Lt.4 Gedung Menteri PU, Jl. Pattimura No. 20
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E7E5DF] text-[#2D323A] text-xs font-semibold shadow-xs hover:bg-[#FAF9F5] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Katalog Publik
        </Link>
      </div>

      {/* Grid Denah Boks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Kolom Kiri: Daftar Grid Boks */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEA]">
            <h2 className="text-xs font-bold text-[#2D323A] uppercase tracking-wider">
              Daftar Boks Arsip ({sortedBoxKeys.length} Boks)
            </h2>
            <span className="text-[10px] text-[#6C727E]">Standar Box 1 - 28</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[520px] overflow-y-auto pr-1">
            {sortedBoxKeys.map((boxName) => {
              const count = boxes[boxName] || 0;
              const isSelected = selectedBox === boxName;
              return (
                <button
                  key={boxName}
                  onClick={() => loadBoxDetail(boxName)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#EFF6FF] border-[#3B82F6] text-[#1E40AF] shadow-xs"
                      : "bg-[#FAF9F5] border-[#E7E5DF] text-[#2D323A] hover:bg-white"
                  }`}
                >
                  <span className="font-bold text-xs font-mono">{boxName}</span>
                  <span className="text-[10px] text-[#6C727E] mt-1">{count} berkas</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Rincian Berkas di Dalam Boks Terpilih */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2D323A]">Isi Berkas: {selectedBox}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F4EE] text-[#4A505C]">
                  {boxArchives.length} Naskah
                </span>
              </div>
              <p className="text-xs text-[#6C727E] mt-0.5">
                Ruang Kerja Bagian PMH BMN, Lt.4 Gedung Menteri PU
              </p>
            </div>

            <Link
              href={`/admin?box=${encodeURIComponent(selectedBox)}`}
              className="text-xs text-[#2563EB] font-bold hover:underline"
            >
              Kelola di Panel Petugas &rarr;
            </Link>
          </div>

          {boxArchives.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6C727E]">
              Tidak ada arsip yang terdata di dalam {selectedBox}.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {boxArchives.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#9CA3AF]">#{idx + 1}</span>
                      <span className="font-mono text-xs font-bold text-[#2563EB]">{item.kode}</span>
                      <span className="text-[11px] text-[#6C727E]">Thn {item.tahun}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        item.jenis_arsip === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {item.jenis_arsip}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#2D323A] line-clamp-1">{item.judul}</div>
                    <div className="text-[11px] text-[#6C727E] line-clamp-1">{item.uraian}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-[#2D323A] font-bold">
                      Retensi: {item.jra?.tahunHabisRetensi}
                    </div>
                    <div className="text-[10px] text-[#6C727E]">
                      {item.pencipta || "Internal PUPR"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
