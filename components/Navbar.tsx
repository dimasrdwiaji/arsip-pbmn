"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  BarChart3, 
  ShieldCheck, 
  Box, 
  FileText, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Building2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string; nama_lengkap: string } | null>(null);

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("arsip_user");
    setUser(null);
    window.location.href = "/";
  };

  // Menu publik (tanpa login): Hanya Katalog Publik dan Dashboard JRA
  // Menu petugas/operator & admin: Tambahan Panel Petugas, Peta Boks Fisik, dan Berita Acara Pemusnahan
  const baseNavLinks = [
    { href: "/", label: "Katalog Publik", icon: Search },
    { href: "/dashboard", label: "Dashboard JRA", icon: BarChart3 },
  ];

  const authNavLinks = [
    { href: "/admin", label: "Panel Petugas", icon: ShieldCheck },
    { href: "/admin/storage", label: "Peta Boks Fisik", icon: Box },
    { href: "/berita-acara", label: "Berita Acara Pemusnahan", icon: FileText },
  ];

  const visibleNavLinks = user ? [...baseNavLinks, ...authNavLinks] : baseNavLinks;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E7E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Judul Aplikasi (Minimalis Aksen Soft PU: Biru & Kuning) */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
                <Building2 className="w-5 h-5 text-[#B45309]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#2D323A]">
                    E-ARSIP <span className="text-[#3B82F6]">PBMN</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    Kemen PUPR
                  </span>
                </div>
                <p className="text-[11px] text-[#6C727E] -mt-0.5 line-clamp-1">
                  Biro Pengelolaan Barang Milik Negara &bull; Bagian PMH
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-[#2D323A] shadow-xs border border-[#E7E5DF]"
                        : "text-[#6C727E] hover:text-[#2D323A] hover:bg-white/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth / Right Button */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2.5 pl-2 border-l border-[#E7E5DF]">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#2D323A] leading-tight">{user.nama_lengkap}</div>
                    <div className="text-[10px] font-medium text-[#D97706]">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-white border border-[#E7E5DF] text-[#6C727E] hover:text-red-600 hover:border-red-200 transition shadow-xs"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold shadow-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login Petugas
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white border border-[#E7E5DF] text-[#2D323A] shadow-xs"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E7E5DF] bg-[#FAF9F5] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-[#2D323A] border border-[#E7E5DF] shadow-xs"
                      : "text-[#6C727E] hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`} />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[#E7E5DF]">
              {user ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E7E5DF]">
                  <div>
                    <div className="text-xs font-bold text-[#2D323A]">{user.nama_lengkap}</div>
                    <div className="text-[10px] text-[#D97706] font-medium">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  Login Petugas Arsip
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
