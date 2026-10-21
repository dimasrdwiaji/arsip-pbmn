"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Download, FileText, LogIn } from "lucide-react";

export default function BeritaAcaraPage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomorBa, setNomorBa] = useState("BA.01/PBMN/ARSIP/2026");
  const [tanggalBa, setTanggalBa] = useState(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
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
    fetchArchivesSiapMusnah();
  }, []);

  const fetchArchivesSiapMusnah = async () => {
    try {
      const res = await fetch("/api/archives?jra=SIAP_MUSNAH");
      const json = await res.json();
      if (json.success) {
        setArchives(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border border-[#E7E5DF] shadow-xs max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2D323A]">Akses Berita Acara Pemusnahan</h2>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Penyusunan dan pencetakan Berita Acara Pemusnahan Arsip merupakan wewenang Panitia Penilai Arsip dan Petugas/Operator yang telah melakukan login.
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

  return (
    <div className="space-y-6">

      {/* Action Bar (Hidden on Print) */}
      <div className="print:hidden bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E5DF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#2D323A]">
            Draft Berita Acara Pemusnahan Arsip Inaktif
          </h1>
          <p className="text-xs text-[#6C727E]">
            Format resmi usulan pemusnahan sesuai <strong>Permen PUPR No. 26 Tahun 2021</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-white text-[#2D323A] border border-[#E7E5DF] text-xs font-semibold shadow-xs transition"
          >
            &larr; Dashboard
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D323A] hover:bg-black text-white text-xs font-bold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
            Cetak Berita Acara (Print)
          </button>
        </div>
      </div>

      {/* Lembar Cetak Dokumen Resmi Berita Acara */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E7E5DF] shadow-xs text-black print:border-none print:p-0 print:shadow-none space-y-6 max-w-4xl mx-auto">
        
        {/* Kop Surat Kementerian PUPR */}
        <div className="text-center border-b-2 border-black pb-4 space-y-1">
          <div className="font-serif font-bold text-sm tracking-wider uppercase">
            KEMENTERIAN PEKERJAAN UMUM DAN PERUMAHAN RAKYAT
          </div>
          <div className="font-serif font-bold text-xs uppercase">
            SEKRETARIAT JENDERAL &bull; BIRO PENGELOLAAN BARANG MILIK NEGARA
          </div>
          <div className="text-[10px] text-gray-600">
            Jalan Pattimura No. 20, Kebayoran Baru, Jakarta Selatan 12110
          </div>
        </div>

        {/* Judul Berita Acara */}
        <div className="text-center space-y-1 pt-2">
          <div className="font-serif font-bold text-sm underline tracking-wide uppercase">
            BERITA ACARA PEMUSNAHAN ARSIP INAKTIF
          </div>
          <div className="text-xs font-medium">
            Nomor: <input 
              type="text" 
              value={nomorBa} 
              onChange={(e) => setNomorBa(e.target.value)} 
              className="border-b border-dashed border-gray-400 text-center font-bold print:border-none print:bg-transparent"
            />
          </div>
        </div>

        {/* Narasi Pembuka */}
        <div className="text-xs leading-relaxed text-justify space-y-3">
          <p>
            Pada hari ini, tanggal <strong>{tanggalBa}</strong>, bertempat di Ruang Kerja Bagian PMH BMN, Biro Pengelolaan Barang Milik Negara, Gedung Menteri PU Lt. 4, kami yang bertandatangan di bawah ini selaku Panitia Penilai Arsip berdasarkan <strong>Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat Nomor 26 Tahun 2021 tentang Jadwal Retensi Arsip</strong>, telah melaksanakan penilaian dan verifikasi teknis terhadap arsip inaktif yang telah melampaui jangka waktu simpan/retensi.
          </p>
          <p>
            Berdasarkan hasil penilaian fisik dan yuridis, menyatakan bahwa sejumlah <strong>{archives.length} berkas naskah arsip</strong> sebagaimana tercantum dalam daftar lampiran di bawah ini dinyatakan <strong>TIDAK MEMILIKI NILAI GUNA PRIMER MAUPUN SEKUNDER</strong> dan diusulkan untuk <strong>DIMUSNAHKAN</strong> secara total dengan cara pencacahan/peleburan.
          </p>
        </div>

        {/* Tabel Lampiran Daftar Arsip */}
        <div className="pt-2 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide">
            LAMPIRAN: DAFTAR ARSIP INAKTIF YANG DIUSULKAN MUSNAH
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 border-b border-black text-center font-bold">
                  <th className="border border-black p-1.5 w-10">No</th>
                  <th className="border border-black p-1.5 w-20">No Berkas</th>
                  <th className="border border-black p-1.5 w-20">Kode</th>
                  <th className="border border-black p-1.5">Uraian Masalah / Kegiatan</th>
                  <th className="border border-black p-1.5 w-14 text-center">Tahun</th>
                  <th className="border border-black p-1.5 w-16 text-center">Jumlah</th>
                  <th className="border border-black p-1.5 min-w-[5rem] text-center whitespace-nowrap">Boks</th>
                  <th className="border border-black p-1.5 w-28 text-center whitespace-nowrap">Dasar Retensi</th>
                </tr>
              </thead>
              <tbody>
                {archives.slice(0, 50).map((item, idx) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{item.no_berkas}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{item.kode}</td>
                    <td className="border border-black p-1.5 font-medium">{item.judul} - {item.uraian}</td>
                    <td className="border border-black p-1.5 text-center">{item.tahun}</td>
                    <td className="border border-black p-1.5 text-center">{item.jumlah}</td>
                    <td className="border border-black p-1.5 text-center whitespace-nowrap font-bold">{item.box}</td>
                    <td className="border border-black p-1.5 text-center text-[10px] whitespace-nowrap">Permen 26/2021 (Retensi: {item.jra?.tahunHabisRetensi})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {archives.length > 50 && (
            <p className="text-[10px] text-gray-500 italic">
              * Menampilkan 50 berkas teratas dari total {archives.length} berkas yang memenuhi syarat pemusnahan.
            </p>
          )}
        </div>

        {/* Tanda Tangan Panitia Penilai Arsip */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
          <div className="space-y-16">
            <div>
              Mengetahui,<br />
              <strong>Kepala Bagian PMH BMN</strong>
            </div>
            <div>
              ( _____________________________ )<br />
              NIP.
            </div>
          </div>

          <div className="space-y-16">
            <div>
              Ketua Panitia Penilai Arsip / Arsiparis,<br />
              <strong>Biro Pengelolaan BMN</strong>
            </div>
            <div>
              ( _____________________________ )<br />
              NIP.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
