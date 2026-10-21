"use client";

import React, { useState, useEffect } from "react";
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
  Check, 
  Eye,
  AlertCircle,
  LogIn,
  X
} from "lucide-react";
import { Dialog } from "primereact/dialog";

export default function AdminArchivePage() {
  const [archives, setArchives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any | null>(null);

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
    box: "BOX 1",
    skkaad: "Terbuka",
    lokasi: "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
    rubrik: "UMUM",
    jenis_arsip: "INAKTIF",
    file_url: null,
  });

  // Dedicated Upload State for row-level upload button
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
    fetchArchives();
  }, []);

  const fetchArchives = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/archives?q=${encodeURIComponent(q)}`);
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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    fetchArchives(val);
  };

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
      box: "BOX 1",
      skkaad: "Terbuka",
      lokasi: "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
      rubrik: "UMUM",
      jenis_arsip: "INAKTIF",
      file_url: null,
    });
    setDialogVisible(true);
  };

  const openEdit = (item: any) => {
    setIsEditing(true);
    setFormPdfFile(null);
    setCurrentArchive({ ...item });
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

      // Jika ada file PDF baru yang dipilih di form
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
      setFormPdfFile(null);
      fetchArchives(search);
    } catch (err) {
      alert("Gagal menyimpan data berkas");
    } finally {
      setSaving(false);
    }
  };

  const deleteArchive = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data berkas ini dari database?")) {
      try {
        await fetch(`/api/archives/${id}`, { method: "DELETE" });
        fetchArchives(search);
      } catch (err) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleSyncExcel = async () => {
    if (confirm("Sinkronkan ulang data dari spreadsheet DAFTAR ARSIP INAKTIF_PMH BMN.xlsx?")) {
      setLoading(true);
      try {
        const res = await fetch("/api/sync-excel", { method: "POST" });
        const json = await res.json();
        alert(json.message);
        fetchArchives();
      } catch (err) {
        alert("Gagal menyinkronkan data.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTargetId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("archiveId", uploadTargetId.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        alert("File scan PDF berhasil diunggah!");
        setUploadDialogVisible(false);
        setSelectedFile(null);
        fetchArchives(search);
      } else {
        alert(json.message || "Gagal mengunggah file");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  // Proteksi Tampilan Pengguna Publik (Jika belum login)
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-[#E7E5DF] shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-xl">
            🔒
          </div>
          <h2 className="text-lg font-bold text-[#2D323A]">Akses Panel Khusus Petugas</h2>
          <p className="text-xs text-[#6C727E] leading-relaxed">
            Halaman Panel Petugas memerlukan autentikasi. Silakan masuk dengan akun petugas atau administrator Anda untuk melakukan entri dan modifikasi arsip.
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

      {/* Top Banner Status Operator */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7E5DF] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D323A] tracking-tight">
              Panel Pengelola <span className="text-[#3B82F6]">Arsip BMN</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              CRUD & Upload
            </span>
          </div>
          <p className="text-xs text-[#6C727E] mt-1">
            Masuk sebagai: <strong className="text-[#2D323A]">{user.nama_lengkap} ({user.role})</strong>
          </p>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={openNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Entri Berkas Baru
          </button>

          <button
            onClick={handleSyncExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-[#2D323A] border border-[#E7E5DF] text-xs font-semibold shadow-sm transition"
            title="Import ulang dari spreadsheet Excel"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F59E0B]" />
            Sinkron Excel
          </button>

          <a
            href="/api/export-excel"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-white text-[#2D323A] border border-[#E7E5DF] text-xs font-semibold shadow-sm transition"
            title="Unduh database ke format XLSX"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export XLSX
          </a>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#E7E5DF] shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-[#9CA3AF] ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Cari naskah untuk diedit/dimutasi boks..."
          className="flex-1 bg-transparent text-xs text-[#2D323A] placeholder-[#9CA3AF] focus:outline-none"
        />
        {search && (
          <button onClick={() => handleSearchChange("")} className="text-xs text-[#9CA3AF] p-1">
            ✕
          </button>
        )}
      </div>

      {/* Main Admin Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E7E5DF] text-center text-sm text-[#6C727E]">
          <div className="animate-spin w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full mx-auto mb-3" />
          Memuat tabel manajemen berkas...
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E7E5DF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold uppercase">
                  <th className="p-3 w-16 text-center">No Berkas</th>
                  <th className="p-3 w-24">Kode</th>
                  <th className="p-3 w-60">Indeks / Judul</th>
                  <th className="p-3 min-w-[6rem] text-center whitespace-nowrap">Boks</th>
                  <th className="p-3 w-20 text-center">Tahun</th>
                  <th className="p-3 min-w-[7rem] text-center whitespace-nowrap">Masa Retensi</th>
                  <th className="p-3 w-24 text-center">File Digital</th>
                  <th className="p-3 w-36 text-center">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {archives.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F5] transition">
                    <td className="p-3 text-center font-bold text-[#9CA3AF]">
                      {item.no_berkas}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#2563EB]">
                      {item.kode}
                    </td>
                    <td className="p-3 font-bold text-[#2D323A]">
                      <div className="line-clamp-1">{item.judul}</div>
                      <div className="text-[11px] text-[#6C727E] font-normal line-clamp-1">{item.uraian}</div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E7E5DF] font-bold text-[#4A505C] text-xs">
                        {item.box}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium">
                      {item.tahun}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#2D323A] px-2.5 py-1 rounded bg-[#FAF9F5] border border-[#E7E5DF] inline-block">
                        {item.jra?.tahunHabisRetensi}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] font-bold hover:underline"
                        >
                          <FileText className="w-3 h-3" /> Ada PDF
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#9CA3AF] italic">Belum Ada</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] transition"
                          title="Edit Berkas & Lampiran PDF"
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

      {/* Dialog Form Tambah / Edit Berkas (Termasuk Opsi Upload & Hapus PDF) */}
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
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">No Urut *</label>
              <input
                type="text"
                required
                value={currentArchive.no_urut}
                onChange={(e) => setCurrentArchive({ ...currentArchive, no_urut: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kode Klasifikasi *</label>
              <input
                type="text"
                required
                value={currentArchive.kode}
                onChange={(e) => setCurrentArchive({ ...currentArchive, kode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs font-mono focus:outline-none"
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
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Uraian Masalah / Kegiatan *</label>
            <textarea
              rows={3}
              required
              value={currentArchive.uraian}
              onChange={(e) => setCurrentArchive({ ...currentArchive, uraian: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
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
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Jumlah</label>
              <input
                type="text"
                value={currentArchive.jumlah}
                onChange={(e) => setCurrentArchive({ ...currentArchive, jumlah: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kondisi</label>
              <select
                value={currentArchive.status_fisik}
                onChange={(e) => setCurrentArchive({ ...currentArchive, status_fisik: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="ASLI">ASLI</option>
                <option value="COPY">COPY</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">SKKAAD</label>
              <select
                value={currentArchive.skkaad}
                onChange={(e) => setCurrentArchive({ ...currentArchive, skkaad: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="Terbuka">Terbuka</option>
                <option value="Terbatas">Terbatas</option>
                <option value="Rahasia">Rahasia</option>
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
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Rubrik / Kategori</label>
              <input
                type="text"
                value={currentArchive.rubrik}
                onChange={(e) => setCurrentArchive({ ...currentArchive, rubrik: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Lokasi Simpan Fisik</label>
            <input
              type="text"
              value={currentArchive.lokasi}
              onChange={(e) => setCurrentArchive({ ...currentArchive, lokasi: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          {/* Bagian Kelola File Digital PDF (Upload & Hapus) */}
          <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                Berkas Digital (Scan PDF)
              </span>
              {currentArchive.file_url && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ada PDF Terlampir
                </span>
              )}
            </div>

            {currentArchive.file_url ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#BFDBFE]">
                <a
                  href={currentArchive.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#2563EB] font-bold hover:underline flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Buka File PDF Saat Ini
                </a>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus PDF
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#6C727E]">Belum ada file scan PDF yang dilampirkan.</p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#1E3A8A] mb-1">
                {currentArchive.file_url ? "Ganti / Unggah Ulang Berkas PDF:" : "Unggah Berkas Scan PDF:"}
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormPdfFile(e.target.files?.[0] || null)}
                className="w-full p-2 rounded-xl border border-dashed border-[#BFDBFE] bg-white text-xs text-[#2D323A] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#2563EB] file:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E5DF] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialogVisible(false)}
              className="px-4 py-2 rounded-xl bg-[#FAF9F5] text-[#2D323A] text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Upload Scan PDF Mandiri (Dari tombol aksi tabel) */}
      <Dialog
        header={<span className="text-sm font-bold text-[#2D323A]">Unggah Berkas Scan PDF</span>}
        visible={uploadDialogVisible}
        onHide={() => setUploadDialogVisible(false)}
        className="w-[95vw] sm:w-[480px]"
      >
        <form onSubmit={handleUploadPdf} className="space-y-4 text-xs pt-1">
          <p className="text-[#6C727E]">
            Pilih file dokumen PDF asli yang sudah dipindai (maksimal 25 MB). Dokumen akan disimpan pada server lokal.
          </p>

          <input
            type="file"
            accept=".pdf"
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full p-3 rounded-2xl border border-dashed border-[#E7E5DF] bg-[#FAF9F5] text-xs text-[#2D323A] file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB] file:text-white"
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadDialogVisible(false)}
              className="px-4 py-2 rounded-xl bg-[#FAF9F5] text-[#2D323A] text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {uploading ? "Mengunggah..." : "Mulai Unggah"}
            </button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
