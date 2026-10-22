"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Search, 
  FileText, 
  Eye,
  LogIn,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Shield,
  BookOpen,
  FolderArchive,
  Users,
  UserPlus,
  Key,
  CheckCircle2
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import { normalizeBox } from "@/lib/jra";
import { translateClassificationCode, CodeTranslation } from "@/lib/classification";

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
  const [sortField, setSortField] = useState<string>("no_berkas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Archive Form State
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
    pencipta: "Biro Pengelolaan BMN",
    kategori_pencipta_3: "Biro PBMN",
    file_url: "",
  });

  // Detail Modal State
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<any | null>(null);

  // User Management State (Khusus Role ADMIN)
  const [userMgmtVisible, setUserMgmtVisible] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    nama_lengkap: "",
    role: "OPERATOR",
    status: "Aktif",
  });

  // Dynamic Options
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
        if (selectedPencipta !== "ALL" && item.kategori_pencipta_3 !== selectedPencipta) return false;
        if (selectedStatus !== "ALL" && item.jenis_arsip !== selectedStatus) return false;
        if (search) {
          const hay = `${item.no_berkas} ${item.no_urut} ${item.judul} ${item.uraian} ${item.kode} ${item.box} ${item.pencipta}`.toLowerCase();
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
  }, [archives, search, selectedTahun, selectedKode, selectedBox, selectedPencipta, selectedStatus, sortField, sortOrder]);

  const openNew = () => {
    setIsEditing(false);
    setCurrentArchive({
      no_berkas: String(archives.length + 1),
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
      pencipta: "Biro Pengelolaan BMN",
      kategori_pencipta_3: "Biro PBMN",
      file_url: "",
    });
    setDialogVisible(true);
  };

  const openEdit = (item: any) => {
    setIsEditing(true);
    setCurrentArchive({
      ...item,
      box: normalizeBox(item.box),
      pencipta: item.pencipta || "Biro Pengelolaan BMN",
      kategori_pencipta_3: item.kategori_pencipta_3 || "Biro PBMN",
      file_url: item.file_url || "",
    });
    setDialogVisible(true);
  };

  const openDetail = (item: any) => {
    setSelectedArchive(item);
    setDetailVisible(true);
  };

  const saveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...currentArchive,
        box: normalizeBox(currentArchive.box),
        file_url: (currentArchive.file_url || "").trim() || null,
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
      alert("Terjadi kesalahan saat menyimpan data berkas");
    } finally {
      setSaving(false);
    }
  };

  const deleteArchive = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas arsip ini? Data yang dihapus tidak dapat dipulihkan.")) return;
    try {
      await fetch(`/api/archives/${id}`, { method: "DELETE" });
      fetchArchives(search);
    } catch (err) {
      console.error(err);
    }
  };

  // User Management Methods (Khusus Role ADMIN)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) {
        setUsersList(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const openUserManagement = () => {
    setUserMgmtVisible(true);
    fetchUsers();
  };

  const openNewUser = () => {
    setEditingUserId(null);
    setUserFormData({
      username: "",
      password: "",
      nama_lengkap: "",
      role: "OPERATOR",
      status: "Aktif",
    });
    setUserFormVisible(true);
  };

  const openEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserFormData({
      username: u.username,
      password: "", // kosongkan jika tidak ingin mengubah password
      nama_lengkap: u.nama_lengkap,
      role: u.role,
      status: u.status || "Aktif",
    });
    setUserFormVisible(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...userFormData,
        operator: user?.username || "Admin",
      };

      if (editingUserId) {
        const res = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          alert(json.message || "Gagal memperbarui pengguna");
          return;
        }
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          alert(json.message || "Gagal membuat pengguna");
          return;
        }
      }

      setUserFormVisible(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan data pengguna");
    }
  };

  const deleteUser = async (userId: number, uname: string) => {
    if (uname === "admin" || userId === 1) {
      alert("Akun Super Administrator utama tidak dapat dihapus.");
      return;
    }
    if (!confirm(`Hapus akun pengguna '${uname}'?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}?operator=${encodeURIComponent(user?.username || "Admin")}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message || "Gagal menghapus pengguna");
        return;
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
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

  // Evaluasi translasi kode saat modal detail dibuka
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
            Pengelolaan naskah arsip, penataan boks fisik, dan tautan dokumen online.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Tombol Khusus Role ADMIN (Superadmin / Admin Privilege) */}
          {user?.role === "ADMIN" && (
            <button
              onClick={openUserManagement}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F4EE] text-[#2D323A] border border-[#E7E5DF] text-xs font-bold shadow-xs transition"
              title="Kelola Akun & Hak Akses Pengguna"
            >
              <Users className="w-4 h-4 text-[#D97706]" />
              Manajemen Pengguna
            </button>
          )}

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
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Pencipta (3 Tier)</label>
            <select
              value={selectedPencipta}
              onChange={(e) => setSelectedPencipta(e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A]"
            >
              <option value="ALL">Semua Pencipta</option>
              <option value="Biro PBMN">Biro PBMN</option>
              <option value="Kementerian PU">Kementerian PU</option>
              <option value="Eksternal">Eksternal</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#6C727E] uppercase block mb-1">Status Siklus</label>
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

      {/* Tabel Data Penyelarasan Kolom Sesuai Excel Asli */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
          <div className="animate-spin w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full mx-auto mb-2" />
          Memuat data arsip...
        </div>
      ) : filteredAndSortedArchives.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E7E5DF] text-center text-xs text-[#6C727E]">
          Tidak ada berkas yang sesuai dengan kriteria pencarian dan filter Anda.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E5DF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase tracking-wider">
                  {/* 1. No Berkas */}
                  <th onClick={() => handleSort("no_berkas")} className="p-3 w-16 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    No Berkas {renderSortIndicator("no_berkas")}
                  </th>
                  {/* 2. No Urut */}
                  <th onClick={() => handleSort("no_urut")} className="p-3 w-14 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    No Urut {renderSortIndicator("no_urut")}
                  </th>
                  {/* 3. Kode */}
                  <th onClick={() => handleSort("kode")} className="p-3 w-24 cursor-pointer select-none hover:text-[#2D323A]">
                    Kode {renderSortIndicator("kode")}
                  </th>
                  {/* 4. Indeks / Judul */}
                  <th onClick={() => handleSort("judul")} className="p-3 min-w-[200px] cursor-pointer select-none hover:text-[#2D323A]">
                    Indeks / Judul Berkas {renderSortIndicator("judul")}
                  </th>
                  {/* 5. Uraian Masalah / Kegiatan */}
                  <th onClick={() => handleSort("uraian")} className="p-3 min-w-[220px] cursor-pointer select-none hover:text-[#2D323A]">
                    Uraian Masalah / Kegiatan {renderSortIndicator("uraian")}
                  </th>
                  {/* 6. Tahun */}
                  <th onClick={() => handleSort("tahun")} className="p-3 w-16 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    Tahun {renderSortIndicator("tahun")}
                  </th>
                  {/* 7. Jumlah */}
                  <th className="p-3 w-16 text-center">Jumlah</th>
                  {/* 8. Asli / Copy */}
                  <th className="p-3 w-14 text-center">Fisik</th>
                  {/* 9. Boks */}
                  <th onClick={() => handleSort("box")} className="p-3 w-20 cursor-pointer select-none hover:text-[#2D323A]">
                    Boks {renderSortIndicator("box")}
                  </th>
                  {/* 10. SKKAAD */}
                  <th onClick={() => handleSort("skkaad")} className="p-3 w-20 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    SKKAAD {renderSortIndicator("skkaad")}
                  </th>
                  {/* 11. Lokasi */}
                  <th className="p-3 w-28">Lokasi</th>
                  {/* 12. Pencipta */}
                  <th onClick={() => handleSort("kategori_pencipta_3")} className="p-3 w-32 cursor-pointer select-none hover:text-[#2D323A]">
                    Pencipta {renderSortIndicator("kategori_pencipta_3")}
                  </th>
                  {/* 13. Masa Retensi */}
                  <th onClick={() => handleSort("masa_retensi")} className="p-3 w-24 text-center cursor-pointer select-none hover:text-[#2D323A]">
                    Masa Retensi {renderSortIndicator("masa_retensi")}
                  </th>
                  {/* 14. Dokumen Online */}
                  <th className="p-3 w-24 text-center">Dokumen Online</th>
                  {/* 15. Aksi */}
                  <th className="p-3 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {filteredAndSortedArchives.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F5] transition">
                    <td className="p-3 text-center text-[#9CA3AF] font-medium font-mono">{item.no_berkas}</td>
                    <td className="p-3 text-center text-[#9CA3AF] font-medium font-mono">{item.no_urut}</td>
                    <td className="p-3 font-mono font-bold text-[#2563EB] whitespace-nowrap">{item.kode}</td>
                    <td 
                      className="p-3 font-bold text-[#2D323A] cursor-pointer hover:text-[#2563EB] transition"
                      onClick={() => openDetail(item)}
                      title="Klik untuk membuka detail & translasi kodefikasi"
                    >
                      <span className="line-clamp-2">{item.judul}</span>
                    </td>
                    <td className="p-3 text-[#6C727E] text-[11px] leading-relaxed">
                      <span className="line-clamp-2">{item.uraian}</span>
                    </td>
                    <td className="p-3 text-center font-semibold text-[#2D323A] whitespace-nowrap">{item.tahun}</td>
                    <td className="p-3 text-center text-[#6C727E] whitespace-nowrap">{item.jumlah || "1 berkas"}</td>
                    <td className="p-3 text-center whitespace-nowrap font-medium text-[11px] text-[#4A505C]">{item.status_fisik || "ASLI"}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#F5F4EE] border border-[#E7E5DF] text-[11px] font-mono font-semibold text-[#2D323A]">
                        {item.box}
                      </span>
                    </td>
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
                    <td className="p-3 text-[#6C727E] text-[11px] truncate max-w-[120px]" title={item.lokasi}>
                      {item.lokasi || "Gedung Menteri PU Lt.4"}
                    </td>
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
                    <td className="p-3 text-center whitespace-nowrap font-mono font-bold text-[#2D323A]">
                      {item.jra?.tahunHabisRetensi}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] border border-[#BFDBFE] font-medium text-[10px] transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Buka Link
                        </a>
                      ) : (
                        <span className="text-[#9CA3AF] text-[11px]">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A]"
                          title="Lihat Detail & Translasi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg bg-white hover:bg-[#EFF6FF] border border-[#E7E5DF] text-[#2563EB]"
                          title="Edit Berkas"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteArchive(item.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-red-50 border border-[#E7E5DF] text-red-600"
                          title="Hapus Berkas"
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

      {/* Formulir Tambah / Edit Berkas (Input Link File Online) */}
      <Dialog
        header={isEditing ? `Edit Berkas #${currentArchive.no_berkas}` : "Tambah Naskah Berkas Baru"}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        className="w-[95vw] sm:w-[680px]"
      >
        <form onSubmit={saveArchive} className="space-y-4 pt-2 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">No. Berkas</label>
              <input
                type="text"
                required
                value={currentArchive.no_berkas}
                onChange={(e) => setCurrentArchive({ ...currentArchive, no_berkas: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">No. Urut</label>
              <input
                type="text"
                required
                value={currentArchive.no_urut}
                onChange={(e) => setCurrentArchive({ ...currentArchive, no_urut: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kode Klasifikasi</label>
              <input
                type="text"
                required
                placeholder="Contoh: PS 0403"
                value={currentArchive.kode}
                onChange={(e) => setCurrentArchive({ ...currentArchive, kode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] font-mono text-xs focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Indeks / Judul Berkas</label>
            <input
              type="text"
              required
              placeholder="Contoh: Hibah BMN Berupa Jembatan Gantung"
              value={currentArchive.judul}
              onChange={(e) => setCurrentArchive({ ...currentArchive, judul: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Uraian Masalah / Perihal Naskah</label>
            <textarea
              rows={3}
              required
              placeholder="Uraian isi informasi arsip..."
              value={currentArchive.uraian}
              onChange={(e) => setCurrentArchive({ ...currentArchive, uraian: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Tahun Dokumen</label>
              <input
                type="number"
                required
                value={currentArchive.tahun}
                onChange={(e) => setCurrentArchive({ ...currentArchive, tahun: parseInt(e.target.value, 10) || 2024 })}
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
              <label className="block font-bold text-[#2D323A] mb-1">Kondisi Fisik</label>
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
              <label className="block font-bold text-[#2D323A] mb-1">Nomor Boks</label>
              <input
                type="text"
                required
                value={currentArchive.box}
                onChange={(e) => setCurrentArchive({ ...currentArchive, box: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Akses Keamanan (SKKAAD)</label>
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
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Kategori Pencipta (3 Tier)</label>
              <select
                value={currentArchive.kategori_pencipta_3 || "Biro PBMN"}
                onChange={(e) => setCurrentArchive({ ...currentArchive, kategori_pencipta_3: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="Biro PBMN">Biro PBMN</option>
                <option value="Kementerian PU">Kementerian PU</option>
                <option value="Eksternal">Eksternal</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Status Siklus</label>
              <select
                value={currentArchive.jenis_arsip || "INAKTIF"}
                onChange={(e) => setCurrentArchive({ ...currentArchive, jenis_arsip: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="INAKTIF">Inaktif (Simpan Retensi)</option>
                <option value="AKTIF">Aktif (Operasional)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Nama Instansi / Unit Pencipta</label>
            <input
              type="text"
              value={currentArchive.pencipta || ""}
              onChange={(e) => setCurrentArchive({ ...currentArchive, pencipta: e.target.value })}
              placeholder="Contoh: Biro Pengelolaan BMN / Ditjen Cipta Karya / Kemenkeu"
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Lokasi Simpan Fisik</label>
            <input
              type="text"
              value={currentArchive.lokasi || ""}
              onChange={(e) => setCurrentArchive({ ...currentArchive, lokasi: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          {/* INPUT LINK FILE ONLINE (Pengganti Upload Fisik) */}
          <div className="p-3.5 rounded-xl bg-[#EFF6FF]/60 border border-[#BFDBFE] space-y-1.5">
            <label className="block font-bold text-[#1E40AF]">
              Link File Dokumen Online (Google Drive / OneDrive / Cloud Storage)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/... atau https://onedrive.live.com/..."
              value={currentArchive.file_url || ""}
              onChange={(e) => setCurrentArchive({ ...currentArchive, file_url: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#BFDBFE] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
            <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
              Masukkan URL tautan dokumen digital yang telah diunggah di cloud storage (misal link Google Drive dengan izin "Siapa saja yang memiliki link dapat melihat").
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EFEA]">
            <button
              type="button"
              onClick={() => setDialogVisible(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#E7E5DF] text-[#4A505C] font-semibold text-xs hover:bg-[#FAF9F5]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Berkas"}
            </button>
          </div>

        </form>
      </Dialog>

      {/* Dialog Detail & Translasi Kodefikasi (Admin View) */}
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
        className="w-[95vw] sm:w-[720px]"
      >
        {selectedArchive && translationInfo && (
          <div className="space-y-4 text-xs pt-1 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Indeks / Judul:</span>
              <h2 className="text-sm sm:text-base font-bold text-[#2D323A] mt-0.5">{selectedArchive.judul}</h2>
            </div>

            <div>
              <span className="text-[11px] text-[#6C727E] font-medium block">Uraian Masalah / Perihal Naskah:</span>
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5DF] text-[#2D323A] mt-1 leading-relaxed text-xs">
                {selectedArchive.uraian}
              </div>
            </div>

            {/* Translasi Kodefikasi */}
            <div className="p-3.5 rounded-xl bg-white border border-[#BFDBFE] space-y-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-[#EFF6FF] pb-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E40AF]">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <span>Translasi Kode: {translationInfo.kode}</span>
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

            {/* Identitas Fisik */}
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
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Jumlah & Kondisi</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.jumlah || "1 berkas"} ({selectedArchive.status_fisik || "ASLI"})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">SKKAAD (Permen 27/2021)</span>
                <span className="font-bold text-[#2D323A]">{selectedArchive.skkaad}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Masa Retensi</span>
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
                  <span className="font-medium text-[#2D323A]">{selectedArchive.pencipta || "Biro Pengelolaan BMN"}</span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-[#6C727E] block uppercase font-bold">Lokasi Simpan Fisik</span>
                <span className="text-[#4A505C]">{selectedArchive.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN"}</span>
              </div>
            </div>

            {/* Dokumen Online Link */}
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

      {/* Modal Manajemen Pengguna & Hak Akses (Khusus Role ADMIN) */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D97706]" />
            <span className="text-sm font-bold text-[#2D323A]">
              Manajemen Akun & Hak Akses Pengguna
            </span>
          </div>
        }
        visible={userMgmtVisible}
        onHide={() => setUserMgmtVisible(false)}
        className="w-[95vw] sm:w-[700px]"
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#6C727E]">
              Kelola daftar akun petugas, ubah level otorisasi (Admin, Operator, Verifikator), dan status aktif pengguna.
            </p>
            <button
              onClick={openNewUser}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Buat Akun Baru
            </button>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-[#6C727E]">Memuat data akun pengguna...</div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E7E5DF] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E5DF] text-[#4A505C] font-semibold text-[11px] uppercase">
                    <th className="p-2.5">Username</th>
                    <th className="p-2.5">Nama Lengkap</th>
                    <th className="p-2.5 text-center">Hak Akses / Role</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-2.5 font-mono font-bold text-[#2D323A]">{u.username}</td>
                      <td className="p-2.5 text-[#4A505C]">{u.nama_lengkap}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "ADMIN" 
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : u.role === "VERIFIKATOR"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === "Nonaktif"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {u.status || "Aktif"}
                        </span>
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditUser(u)}
                            className="p-1 rounded bg-[#FAF9F5] hover:bg-[#EFF6FF] border border-[#E7E5DF] text-[#2563EB]"
                            title="Ubah Role / Reset Password"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.username !== "admin" && (
                            <button
                              onClick={() => deleteUser(u.id, u.username)}
                              className="p-1 rounded bg-[#FAF9F5] hover:bg-red-50 border border-[#E7E5DF] text-red-600"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Dialog>

      {/* Dialog Buat / Edit Akun Pengguna */}
      <Dialog
        header={editingUserId ? "Ubah Otorisasi / Reset Akun Pengguna" : "Buat Akun Pengguna Baru"}
        visible={userFormVisible}
        onHide={() => setUserFormVisible(false)}
        className="w-[95vw] sm:w-[460px]"
      >
        <form onSubmit={saveUser} className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Username</label>
            <input
              type="text"
              required
              disabled={!!editingUserId}
              value={userFormData.username}
              onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
              placeholder="Contoh: aris.pmh"
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={userFormData.nama_lengkap}
              onChange={(e) => setUserFormData({ ...userFormData, nama_lengkap: e.target.value })}
              placeholder="Contoh: Aris Prabowo, S.Sos."
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">
              {editingUserId ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
            </label>
            <input
              type="password"
              required={!editingUserId}
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              placeholder={editingUserId ? "Ketik jika ingin reset password..." : "Ketik password..."}
              className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Hak Akses / Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none font-semibold text-[#2D323A]"
              >
                <option value="OPERATOR">OPERATOR (Petugas Arsip)</option>
                <option value="VERIFIKATOR">VERIFIKATOR (Penilai Arsip)</option>
                <option value="ADMIN">ADMIN (Super Administrator)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D323A] mb-1">Status Akun</label>
              <select
                value={userFormData.status}
                onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] text-xs focus:outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EFEA]">
            <button
              type="button"
              onClick={() => setUserFormVisible(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#E7E5DF] text-[#4A505C] font-semibold text-xs hover:bg-[#FAF9F5]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs"
            >
              {editingUserId ? "Perbarui Pengguna" : "Simpan Pengguna"}
            </button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
