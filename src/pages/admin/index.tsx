"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Outfit } from "next/font/google";
import Link from "next/link";
import {
  Gavel,
  Users,
  Building2,
  Tags,
  BarChart3,
  Settings,
  FileText,
  PlusCircle,
} from "lucide-react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const adminMenuItems = [
  {
    title: "Kelola Lelang",
    description: "Tambah, edit, dan kelola item lelang",
    icon: Gavel,
    href: "/admin/auctions",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    title: "Tambah Item Baru",
    description: "Buat item lelang baru",
    icon: PlusCircle,
    href: "/admin/auctions/create",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Penjual",
    description: "Kelola data penjual",
    icon: Users,
    href: "/admin/sellers",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Penyelenggara",
    description: "Kelola data penyelenggara lelang",
    icon: Building2,
    href: "/admin/organizers",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Kategori",
    description: "Kelola kategori item",
    icon: Tags,
    href: "/admin/categories",
    color: "from-teal-500 to-green-500",
  },
  {
    title: "Laporan",
    description: "Lihat statistik dan laporan",
    icon: BarChart3,
    href: "/admin/reports",
    color: "from-amber-500 to-yellow-500",
  },
];

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Kelola semua aspek sistem lelang Anda</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Item", value: "124", icon: "📦" },
            { label: "Lelang Aktif", value: "18", icon: "🔥" },
            { label: "Total Bid", value: "1,247", icon: "💰" },
            { label: "Pemenang Bulan Ini", value: "32", icon: "🏆" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 text-center hover:border-zinc-700/50 transition-all duration-300"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm">{item.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-10 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/auctions/create"
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Tambah Item Lelang
            </Link>
            <Link
              href="/admin/auctions"
              className="px-5 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Lihat Semua Item
            </Link>
            <Link
              href="/admin/settings"
              className="px-5 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Pengaturan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

