import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { PrimeReactProvider } from "primereact/api";

export const metadata: Metadata = {
  title: "E-Arsip Biro PBMN | Kementerian PUPR",
  description: "Sistem Informasi Pengelolaan & Jadwal Retensi Arsip Biro Pengelolaan BMN Kementerian PUPR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#FAF9F5] text-[#2D323A] min-h-screen flex flex-col antialiased selection:bg-[#FEF3C7] selection:text-[#92400E]">
        <PrimeReactProvider value={{ ripple: true }}>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-[#E7E5DF] py-6 text-center text-xs text-[#6C727E] bg-[#FAF9F5]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                &copy; {new Date().getFullYear()} Biro Pengelolaan Barang Milik Negara &bull; Bagian PMH BMN
              </p>
              <p className="text-[11px] text-[#9CA3AF]">
                Sesuai Permen PUPR No. 26 Tahun 2021 tentang Jadwal Retensi Arsip (JRA)
              </p>
            </div>
          </footer>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
