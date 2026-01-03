"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Outfit } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper to get access token from session or localStorage
function getAccessToken(session: any): string | null {
  if (session?.accessToken) {
    return session.accessToken;
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

interface AuctionItem {
  id: number;
  lot_code: string;
  item_name: string;
  category?: { category_name: string };
  status: string;
  current_highest_bid: number;
  starting_price: number;
  bid_count: number;
  view_count: number;
  images?: { image_url: string; image_type: string }[];
  schedule?: { auction_start: string; auction_end: string };
  created_at: string;
}

function formatCurrency(amount: number): string {
  if (!amount) return "Rp 0";
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}M`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2, label: "Published" };
    case "ongoing":
      return { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock, label: "Ongoing" };
    case "draft":
      return { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: FileText, label: "Draft" };
    case "closed":
      return { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: XCircle, label: "Closed" };
    case "cancelled":
      return { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle, label: "Cancelled" };
    default:
      return { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: FileText, label: status };
  }
}

export default function AdminAuctionsPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get access token from session
  const accessToken = getAccessToken(session);

  // Fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/items?${params}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAuctions(data.data || []);
          setTotalPages(data.meta?.total_pages || 1);
        }
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authStatus !== "loading") {
      const debounce = setTimeout(fetchAuctions, 300);
      return () => clearTimeout(debounce);
    }
  }, [page, searchQuery, statusFilter, accessToken, authStatus]);

  const handlePublish = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/items/${id}/publish`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setAuctions(prev => prev.map(item => 
          item.id === id ? { ...item, status: "published" } : item
        ));
      }
    } catch (error) {
      console.error("Error publishing:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/items/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      if (res.ok) {
        setAuctions(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/auctions");
    }
  }, [authStatus, router]);

  if (authStatus === "loading") {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Kelola Lelang</h1>
            <p className="text-zinc-400 text-sm mt-1">Daftar semua item lelang</p>
          </div>
          <Link
            href="/admin/auctions/create"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Item
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari item lelang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="ongoing">Ongoing</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-zinc-400">Memuat data...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && auctions.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum ada item lelang</h3>
            <p className="text-zinc-400 mb-6">Mulai dengan menambahkan item lelang pertama</p>
            <Link
              href="/admin/auctions/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Item
            </Link>
          </div>
        )}

        {/* Auction List */}
        {!loading && auctions.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-6">Item</th>
                    <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-4">Status</th>
                    <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-4">Harga Tertinggi</th>
                    <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-4">Bids</th>
                    <th className="text-left text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-4">Jadwal</th>
                    <th className="text-right text-xs text-zinc-500 font-medium uppercase tracking-wider py-4 px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {auctions.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const StatusIcon = statusBadge.icon;
                    const mainImage = item.images?.find(img => img.image_type === "main")?.image_url || 
                                     item.images?.[0]?.image_url;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                              {mainImage ? (
                                <Image
                                  src={mainImage}
                                  alt={item.item_name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <FileText className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.item_name}</p>
                              <p className="text-zinc-500 text-sm">{item.lot_code}</p>
                              <p className="text-zinc-600 text-xs">{item.category?.category_name || "No Category"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">
                            {formatCurrency(item.current_highest_bid || item.starting_price)}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            Start: {formatCurrency(item.starting_price)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white">{item.bid_count} bids</p>
                          <p className="text-zinc-500 text-xs">{item.view_count} views</p>
                        </td>
                        <td className="py-4 px-4">
                          {item.schedule ? (
                            <div className="text-sm">
                              <p className="text-zinc-400">
                                {formatDate(item.schedule.auction_start)}
                              </p>
                              <p className="text-zinc-500 text-xs">
                                s/d {formatDate(item.schedule.auction_end)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-sm">Belum dijadwalkan</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${item.id}`}
                              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                              title="Lihat"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/auctions/edit/${item.id}`}
                              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            {item.status === "draft" && (
                              <>
                                <button
                                  onClick={() => handlePublish(item.id)}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                  title="Publish"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-zinc-800/50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-zinc-400 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

