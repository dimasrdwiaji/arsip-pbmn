"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem("arsip_user", JSON.stringify(json.user));
        router.push("/admin");
      } else {
        setError(json.message || "Username atau password salah");
      }
    } catch (err) {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E5DF] shadow-sm space-y-6 relative overflow-hidden">
        
        {/* Soft PU Background Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FEF3C7]/40 rounded-full -mr-12 -mt-12 pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#2D323A] tracking-tight">
            Login Petugas Pengelola
          </h1>
          <p className="text-xs text-[#6C727E]">
            Akses khusus entri data, edit naskah, dan unggah scan PDF arsip BMN.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username akun petugas"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D323A] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] text-xs text-[#2D323A] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#2D323A] hover:bg-black text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Panel Kerja"}
          </button>
        </form>

        {/* Akun Bawaan Testing */}
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E7E5DF] space-y-2 text-[11px]">
          <span className="font-bold text-[#2D323A] flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
            Akun Siap Pakai (Localhost):
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[#6C727E]">Admin: <code>admin</code> / <code>admin123</code></span>
            <button
              type="button"
              onClick={() => quickFill("admin", "admin123")}
              className="px-2 py-0.5 rounded bg-white border border-[#E7E5DF] text-[10px] font-bold text-[#2563EB]"
            >
              Pilih
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6C727E]">Petugas: <code>petugas</code> / <code>petugas123</code></span>
            <button
              type="button"
              onClick={() => quickFill("petugas", "petugas123")}
              className="px-2 py-0.5 rounded bg-white border border-[#E7E5DF] text-[10px] font-bold text-[#2563EB]"
            >
              Pilih
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-[#6C727E] hover:text-[#2D323A] font-semibold">
            &larr; Kembali ke Katalog Publik
          </Link>
        </div>

      </div>
    </div>
  );
}
