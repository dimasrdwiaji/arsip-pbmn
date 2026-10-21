"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Search, 
  FileText, 
  Eye,
  LogIn,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import { normalizeBox } from "@/lib/jra";

export default function AdminArchivePage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("ALL");
  const [selectedKode, setSelectedKode] = useState("ALL");
  const [selectedBox, setSelectedBox] = useState("ALL");
  const [selectedPencipta, setSelectedPencipta] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Sorting
  const [sortField, setSortField] = useState<string>("tahun");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form State
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formPdfFile, setFormPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentArchive, setCurrentArchive] = useState<any>({
    no_berkas: "1",
    no_urut: "1",
    kode: "PS 0501",
    judul: "",
    uraian: "",
    tahun: 2024,
    jumlah: "1 berkas",
    status_fisik: "ASLI",
    box: "Box 1",
    skkaad: "Terbuka",
    lokasi: "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
    rubrik: "UMUM",
    jenis_arsip: "INAKTIF",
    pencipta: "Kementerian PUPR",
    kategori_pencipta: "INTERNAL",
    file_url: null,
  });

  // Dedicated Upload State
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Options
  const [tahunOptions, setTahunOptions] = useState<number[]>([]);
  const [kodeOptions, setKodeOptions] = useState<string[]>([]);
  const [boxOptions, setBoxOptions] = useState<string[]>([]);

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
    fetchArchives();
  }, []);

  const fetchArchives = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/archives?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        setArchives(json.data);

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedArchives = useMemo(() => {
    return archives
      .filter((item) => {
        if (selectedTahun !== "ALL" && String(item.tahun) !== selectedTahun) return false;
        if (selectedKode !== "ALL" && !item.kode.replace(/\s+/g, "").includes(selectedKode.replace(/\s+/g, ""))) return false;
        if (selectedBox !== "ALL" && item.box !== selectedBox) return false;
        if (selectedPencipta !== "ALL" && item.kategori_pencipta !== selectedPencipta) return false;
        if (selectedStatus !== "ALL" && item.jenis_arsip !== selectedStatus) return false;
        if (search) {
          const hay = `${item.no_berkas} ${item.judul} ${item.uraian} ${item.kode} ${item.box} ${item.pencipta}`.toLowerCase();
          if (!hay.includes(search.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
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
        } else if (typeof valA === "string") {
          valA = (valA || "").toLowerCase();
          valB = (valB || "").toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [archives, search, selectedTahun, selectedKode, selectedBox, selectedPencipta, selectedStatus, sortField, sortOrder]);

  const openNew = () => {
    setIsEditing(false);
    setFormPdfFile(null);
    setCurrentArchive({
      no_berkas: "1",
      no_urut: "1",
      kode: "PS 0501",
      judul: "",
      uraian: "",
      tahun: 2024,
      jumlah: "1 berkas",
      status_fisik: "ASLI",
      box: "Box 1",
      skkaad: "Terbuka",
      lokasi: "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
      rubrik: "UMUM",
      jenis_arsip: "INAKTIF",
      pencipta: "Kementerian PUPR",
      kategori_pencipta: "INTERNAL",
      file_url: null,
    });
    setDialogVisible(true);
  };

  const openEdit = (item: any) => {
    setIsEditing(true);
    setFormPdfFile(null);
    setCurrentArchive({
      ...item,
      box: normalizeBox(item.box),
      pencipta: item.pencipta || "Kementerian PUPR",
      kategori_pencipta: item.kategori_pencipta || "INTERNAL",
    });
    setDialogVisible(true);
  };

  const handleRemovePdf = () => {
    if (confirm("Apakah Anda yakin ingin menghapus lampiran file PDF dari berkas ini?")) {
      setCurrentArchive({ ...currentArchive, file_url: null });
      setFormPdfFile(null);
    }
  };

  const saveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalFileUrl = currentArchive.file_url;

      if (formPdfFile) {
        const formData = new FormData();
        formData.append("file", formPdfFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          finalFileUrl = uploadJson.fileUrl;
        } else {
          alert("Gagal mengunggah PDF: " + (uploadJson.message || ""));
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...currentArchive,
        box: normalizeBox(currentArchive.box),
        file_url: finalFileUrl,
        operator: user?.username || "Petugas",
      };

      if (isEditing) {
        await fetch(`/api/archives/${currentArchive.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/archives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setDialogVisible(false);
      fetchArchives(search);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const deleteArchive = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip ini? Data yang dihapus tidak dapat dipulihkan.")) return;
    try {
      await fetch(`/api/archives/${id}`, { method: "DELETE" });
      fetchArchives(search);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTargetId) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();

      if (uploadJson.success) {
        await fetch(`/api/archives/${uploadTargetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_url: uploadJson.fileUrl,
            operator: user?.username || "Petugas",
          }),
        });

        setUploadDialogVisible(false);
        setSelectedFile(null);
        fetchArchives(search);
      } else {
        alert("Gagal mengunggah PDF: " + (uploadJson.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah PDF");
    } finally {
      setUploading(false);
    }
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border border-[#E7E5DF] shadow-xs max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2D323A]">Akses Khusus Petugas Arsip</h2>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Halaman Panel Petugas memerlukan autentikasi operator atau administrator untuk melakukan penambahan, perubahan, dan penataan berkas fisik.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D323A] hover:bg-black text-white text-xs font-bold shadow-xs transition"
            >
              Masuk / Login Petugas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
            Panel Petugas <span className="text-[#3B82F6]">Arsip BMN</span>
          </h1>
          <p className="text-xs text-[#6C727E] mt-0.5">
            Pengelolaan naskah arsip, penataan boks fisik, dan pelampiran dokumen scan PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={openNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Entri Berkas Baru
          </button>

          <a
            href="/api/export-excel"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#2D323A] border border-[#E7E5DF] text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export XLSX
          </a>
        </div>
      </div>

      {/* Search & 1 Baris Filter Lengkap */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7E5DF] shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor berkas, judul naskah, pencipta, atau kode klasifikasi..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1 Baris Filter di Bawah Search Box */}
        <div className="pt-2 border-t border-[#F0EFEA] grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Tahun</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Tahun</option>
              {tahunOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Kode</label>
            <select
              value={selectedKode}
              onChange={(e) => setSelectedKode(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Kode</option>
              {kodeOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Boks</label>
            <select
              value={selectedBox}
              onChange={(e) => setSelectedBox(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Boks</option>
              {boxOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Pencipta</label>
            <select
              value={selectedPencipta}
              onChange={(e) => setSelectedPencipta(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Pencipta</option>
              <option value="INTERNAL">Internal PUPR</option>
              <option value="EKSTERNAL">Eksternal (Luar)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="INAKTIF">Inaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Admin Table dengan Sortir Kolom */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
          <div className="animate-spin w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-2" />
          Memuat data arsip...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase tracking-wider">
                  <th onClick={() => handleSort("no_berkas")} className="p-3 w-14 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    No {renderSortIndicator("no_berkas")}
                  </th>
                  <th onClick={() => handleSort("box")} className="p-3 w-24 cursor-pointer select-none hover:text-[#2D323A]">
                    Boks {renderSortIndicator("box")}
                  </th>
                  <th onClick={() => handleSort("kode")} className="p-3 w-28 cursor-pointer select-none hover:text-[#2D323A]">
                    Kode {renderSortIndicator("kode")}
                  </th>
                  <th onClick={() => handleSort("tahun")} className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    Tahun {renderSortIndicator("tahun")}
                  </th>
                  <th onClick={() => handleSort("judul")} className="p-3 min-w-[260px] cursor-pointer select-none hover:text-[#2D323A]">
                    Uraian Masalah / Judul {renderSortIndicator("judul")}
                  </th>
                  <th onClick={() => handleSort("pencipta")} className="p-3 w-36 cursor-pointer select-none hover:text-[#2D323A]">
                    Pencipta {renderSortIndicator("pencipta")}
                  </th>
                  <th onClick={() => handleSort("jenis_arsip")} className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    Status {renderSortIndicator("jenis_arsip")}
                  </th>
                  <th onClick={() => handleSort("masa_retensi")} className="p-3 w-28 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    Masa Retensi {renderSortIndicator("masa_retensi")}
                  </th>
                  <th className="p-3 w-20 text-center">PDF</th>
                  <th className="p-3 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {filteredAndSortedArchives.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => openEdit(item)}
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
                      <div className="font-bold text-[#2D323A] line-clamp-1">{item.judul}</div>
                      <div className="text-[11px] text-[#6C727E] font-normal line-clamp-1">{item.uraian}</div>
                    </td>
                    <td className="p-3 text-[11px]">
                      <div className="font-medium text-[#2D323A] truncate max-w-[130px]">{item.pencipta || "Internal PUPR"}</div>
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
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-bold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" /> PDF
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#9CA3AF] italic">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] transition"
                          title="Edit Berkas"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setUploadTargetId(item.id);
                            setUploadDialogVisible(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A] transition"
                          title="Upload Scan PDF"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteArchive(item.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog Form Tambah / Edit Berkas */}
      <Dialog
        header={
          <span className="text-sm font-bold text-[#2D323A]">
            {isEditing ? `Edit Berkas Arsip #${currentArchive?.id}` : "Entri Naskah Berkas Baru"}
          </span>
        }
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="w-[95vw] sm:w-[680px]"
      >
        <form onSubmit={saveArchive} className="space-y-3.5 text-xs pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">No Berkas *</label>
              <input
                type="text"
                required
                value={currentArchive.no_berkas}
                onChange={(e) => setCurrentArchive({ ...currentArchive, no_berkas: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">No Urut *</label>
              <input
                type="text"
                required
                value={currentArchive.no_urut}
                onChange={(e) => setCurrentArchive({ ...currentArchive, no_urut: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kode Klasifikasi *</label>
              <input
                type="text"
                required
                value={currentArchive.kode}
                onChange={(e) => setCurrentArchive({ ...currentArchive, kode: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Indeks / Judul Naskah *</label>
            <input
              type="text"
              required
              value={currentArchive.judul}
              onChange={(e) => setCurrentArchive({ ...currentArchive, judul: e.target.value })}
              className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Uraian Masalah / Kegiatan *</label>
            <textarea
              rows={3}
              required
              value={currentArchive.uraian}
              onChange={(e) => setCurrentArchive({ ...currentArchive, uraian: e.target.value })}
              className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Tahun *</label>
              <input
                type="number"
                required
                value={currentArchive.tahun}
                onChange={(e) => setCurrentArchive({ ...currentArchive, tahun: parseInt(e.target.value, 10) })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Jumlah</label>
              <input
                type="text"
                value={currentArchive.jumlah}
                onChange={(e) => setCurrentArchive({ ...currentArchive, jumlah: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kondisi</label>
              <select
                value={currentArchive.status_fisik}
                onChange={(e) => setCurrentArchive({ ...currentArchive, status_fisik: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="ASLI">ASLI</option>
                <option value="COPY">COPY</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Status Siklus</label>
              <select
                value={currentArchive.jenis_arsip}
                onChange={(e) => setCurrentArchive({ ...currentArchive, jenis_arsip: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="INAKTIF">INAKTIF</option>
                <option value="AKTIF">AKTIF</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Pencipta Arsip</label>
              <input
                type="text"
                value={currentArchive.pencipta}
                onChange={(e) => setCurrentArchive({ ...currentArchive, pencipta: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kategori Pencipta</label>
              <select
                value={currentArchive.kategori_pencipta}
                onChange={(e) => setCurrentArchive({ ...currentArchive, kategori_pencipta: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="INTERNAL">Internal PUPR</option>
                <option value="EKSTERNAL">Eksternal (Luar)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Nomor Boks</label>
              <input
                type="text"
                value={currentArchive.box}
                onChange={(e) => setCurrentArchive({ ...currentArchive, box: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">SKKAAD</label>
              <select
                value={currentArchive.skkaad}
                onChange={(e) => setCurrentArchive({ ...currentArchive, skkaad: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="Terbuka">Terbuka</option>
                <option value="Terbatas">Terbatas</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Lokasi Simpan Fisik</label>
            <input
              type="text"
              value={currentArchive.lokasi}
              onChange={(e) => setCurrentArchive({ ...currentArchive, lokasi: e.target.value })}
              className="w-full p-2 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          {/* Bagian PDF */}
          <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
            <span className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
              Berkas Digital (Scan PDF)
            </span>

            {currentArchive.file_url ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-[#BFDBFE]">
                <a
                  href={currentArchive.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#2563EB] font-bold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Buka File PDF
                </a>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus PDF
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#6C727E]">Belum ada file scan PDF yang dilampirkan.</p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#1E3A8A] mb-1">
                {currentArchive.file_url ? "Ganti File PDF:" : "Pilih File PDF:"}
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormPdfFile(e.target.files?.[0] || null)}
                className="w-full p-1.5 rounded-lg border border-dashed border-[#BFDBFE] bg-white text-xs text-[#2D323A]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E5DF] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialogVisible(false)}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAF9F5] text-[#2D323A] text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Upload Scan PDF Mandiri */}
      <Dialog
        header={<span className="text-sm font-bold text-[#2D323A]">Unggah Berkas Scan PDF</span>}
        visible={uploadDialogVisible}
        onHide={() => setUploadDialogVisible(false)}
        className="w-[95vw] sm:w-[480px]"
      >
        <form onSubmit={handleUploadPdf} className="space-y-3.5 text-xs pt-1">
          <p className="text-[#6C727E]">
            Pilih file dokumen PDF asli yang sudah dipindai (maksimal 25 MB).
          </p>

          <input
            type="file"
            accept=".pdf"
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full p-2.5 rounded-xl border border-dashed border-[#E7E5DF] bg-[#FAF9F5] text-xs text-[#2D323A]"
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadDialogVisible(false)}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAF9F5] text-[#2D323A] text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {uploading ? "Mengunggah..." : "Mulai Unggah"}
            </button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
