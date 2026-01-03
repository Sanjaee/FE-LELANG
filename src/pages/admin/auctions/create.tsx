"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Outfit } from "next/font/google";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  DollarSign,
  FileText,
  Building2,
  Users,
  Clock,
  Save,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper to get access token from session or localStorage
function getAccessToken(session: any): string | null {
  // First try to get from session (NextAuth)
  if (session?.accessToken) {
    return session.accessToken;
  }
  // Fallback to localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

// Types
interface Seller {
  id: number;
  seller_name: string;
  seller_type: string;
}

interface Organizer {
  id: number;
  organizer_name: string;
  organizer_type: string;
}

interface Category {
  id: number;
  category_name: string;
}

interface ImageItem {
  id: string;
  url: string;
  type: "main" | "gallery" | "document";
  caption: string;
}

// Item types
const itemTypes = [
  { value: "movable", label: "Barang Bergerak" },
  { value: "immovable", label: "Barang Tidak Bergerak" },
];

// Auction methods
const auctionMethods = [
  { value: "open_bidding", label: "Open Bidding" },
  { value: "closed_bidding", label: "Closed Bidding" },
  { value: "tender", label: "Tender" },
];

// Seller types
const sellerTypes = [
  { value: "bank", label: "Bank" },
  { value: "government", label: "Pemerintah" },
  { value: "company", label: "Perusahaan" },
  { value: "individual", label: "Perorangan" },
];

// Organizer types
const organizerTypes = [
  { value: "KPKNL", label: "KPKNL" },
  { value: "bank", label: "Bank" },
  { value: "private", label: "Swasta" },
];

function formatCurrency(value: string): string {
  const number = value.replace(/\D/g, "");
  return number ? parseInt(number).toLocaleString("id-ID") : "";
}

function parseCurrency(value: string): number {
  return parseInt(value.replace(/\D/g, "")) || 0;
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Master data
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    lot_code: "",
    item_name: "",
    category_id: "",
    seller_id: "",
    organizer_id: "",
    item_type: "movable",
    sub_type: "",
    description: "",
    detailed_description: "",
    limit_price: "",
    deposit_amount: "",
    starting_price: "",
    increment_amount: "",
    auction_method: "open_bidding",
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    registration_start: "",
    registration_end: "",
    deposit_deadline: "",
    auction_start: "",
    auction_end: "",
    announcement_date: "",
  });

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Modal states for creating new seller/organizer/category
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // New entity forms
  const [newSeller, setNewSeller] = useState({ seller_name: "", seller_type: "company", phone: "", email: "" });
  const [newOrganizer, setNewOrganizer] = useState({ organizer_name: "", organizer_type: "private", phone: "", email: "" });
  const [newCategory, setNewCategory] = useState({ category_name: "", description: "" });

  // Get access token from session
  const accessToken = getAccessToken(session);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const token = accessToken;
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch sellers
        const sellersRes = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/sellers`, { headers });
        if (sellersRes.ok) {
          const data = await sellersRes.json();
          setSellers(data.data || []);
        }

        // Fetch organizers
        const organizersRes = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/organizers`, { headers });
        if (organizersRes.ok) {
          const data = await organizersRes.json();
          setOrganizers(data.data || []);
        }

        // Fetch categories
        const categoriesRes = await fetch(`${API_BASE_URL}/api/v1/auctions/categories`);
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchMasterData();
    }
  }, [accessToken, status]);

  // Generate lot code
  useEffect(() => {
    if (!formData.lot_code) {
      const timestamp = Date.now().toString(36).toUpperCase();
      setFormData(prev => ({ ...prev, lot_code: `LOT-${timestamp}` }));
    }
  }, [formData.lot_code]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle currency input
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: formatCurrency(value) }));
  };

  // Handle schedule input change
  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
  };

  // Add image
  const handleAddImage = () => {
    if (!newImageUrl) return;
    
    const newImage: ImageItem = {
      id: Date.now().toString(),
      url: newImageUrl,
      type: images.length === 0 ? "main" : "gallery",
      caption: "",
    };
    
    setImages(prev => [...prev, newImage]);
    setNewImageUrl("");
  };

  // Remove image
  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Set main image
  const handleSetMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      type: img.id === id ? "main" : img.type === "main" ? "gallery" : img.type,
    })));
  };

  // Create seller
  const handleCreateSeller = async () => {
    try {
      const token = accessToken;
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/sellers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newSeller),
      });

      if (res.ok) {
        const data = await res.json();
        setSellers(prev => [...prev, data.data]);
        setFormData(prev => ({ ...prev, seller_id: data.data.id.toString() }));
        setShowSellerModal(false);
        setNewSeller({ seller_name: "", seller_type: "company", phone: "", email: "" });
        toast({ title: "Berhasil", description: "Penjual berhasil ditambahkan" });
      } else {
        throw new Error("Failed to create seller");
      }
    } catch (_error) {
      toast({ title: "Error", description: "Gagal menambahkan penjual", variant: "destructive" });
    }
  };

  // Create organizer
  const handleCreateOrganizer = async () => {
    try {
      const token = accessToken;
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/organizers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newOrganizer),
      });

      if (res.ok) {
        const data = await res.json();
        setOrganizers(prev => [...prev, data.data]);
        setFormData(prev => ({ ...prev, organizer_id: data.data.id.toString() }));
        setShowOrganizerModal(false);
        setNewOrganizer({ organizer_name: "", organizer_type: "private", phone: "", email: "" });
        toast({ title: "Berhasil", description: "Penyelenggara berhasil ditambahkan" });
      } else {
        throw new Error("Failed to create organizer");
      }
    } catch (_error) {
      toast({ title: "Error", description: "Gagal menambahkan penyelenggara", variant: "destructive" });
    }
  };

  // Create category
  const handleCreateCategory = async () => {
    try {
      const token = accessToken;
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(prev => [...prev, data.data]);
        setFormData(prev => ({ ...prev, category_id: data.data.id.toString() }));
        setShowCategoryModal(false);
        setNewCategory({ category_name: "", description: "" });
        toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" });
      } else {
        throw new Error("Failed to create category");
      }
    } catch (_error) {
      toast({ title: "Error", description: "Gagal menambahkan kategori", variant: "destructive" });
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = accessToken;
      
      // Prepare request body
      const requestBody = {
        lot_code: formData.lot_code,
        item_name: formData.item_name,
        category_id: parseInt(formData.category_id),
        seller_id: formData.seller_id, // UUID string, tidak perlu parseInt
        organizer_id: parseInt(formData.organizer_id),
        item_type: formData.item_type,
        sub_type: formData.sub_type,
        description: formData.description,
        detailed_description: formData.detailed_description,
        limit_price: parseCurrency(formData.limit_price),
        deposit_amount: parseCurrency(formData.deposit_amount),
        starting_price: parseCurrency(formData.starting_price),
        increment_amount: parseCurrency(formData.increment_amount),
        auction_method: formData.auction_method,
        images: images.map((img, index) => ({
          image_url: img.url,
          image_type: img.type,
          display_order: index,
          caption: img.caption,
        })),
        schedule: schedule.auction_start ? {
          registration_start: schedule.registration_start ? new Date(schedule.registration_start).toISOString() : undefined,
          registration_end: schedule.registration_end ? new Date(schedule.registration_end).toISOString() : undefined,
          deposit_deadline: new Date(schedule.deposit_deadline).toISOString(),
          auction_start: new Date(schedule.auction_start).toISOString(),
          auction_end: new Date(schedule.auction_end).toISOString(),
          announcement_date: schedule.announcement_date ? new Date(schedule.announcement_date).toISOString() : undefined,
        } : undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auctions/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create auction item");
      }

      const data = await res.json();

      // If publish is requested, publish the item
      if (publish && data.data?.id) {
        await fetch(`${API_BASE_URL}/api/v1/admin/auctions/items/${data.data.id}/publish`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      }

      toast({
        title: "Berhasil",
        description: publish ? "Item lelang berhasil dibuat dan dipublish" : "Item lelang berhasil dibuat sebagai draft",
      });

      router.push("/admin/auctions");
    } catch (error) {
      console.error("Error creating auction:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal membuat item lelang",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/auctions/create");
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
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
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Tambah Item Lelang</h1>
            <p className="text-zinc-400 text-sm mt-1">Isi data lengkap untuk membuat item lelang baru</p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Informasi Dasar
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lot Code */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Kode Lot *</label>
                    <input
                      type="text"
                      name="lot_code"
                      value={formData.lot_code}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Nama Item *</label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Rolex Submariner 2020"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Kategori *</label>
                    <div className="flex gap-2">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                        required
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Type */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Jenis Item *</label>
                    <select
                      name="item_type"
                      value={formData.item_type}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                      required
                    >
                      {itemTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Type */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Sub Jenis</label>
                    <input
                      type="text"
                      name="sub_type"
                      value={formData.sub_type}
                      onChange={handleInputChange}
                      placeholder="Contoh: Jam Tangan Mewah"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Auction Method */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Metode Lelang</label>
                    <select
                      name="auction_method"
                      value={formData.auction_method}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {auctionMethods.map(method => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm text-zinc-400 mb-2">Deskripsi Singkat</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Deskripsi singkat tentang item..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Detailed Description */}
                <div className="mt-4">
                  <label className="block text-sm text-zinc-400 mb-2">Deskripsi Lengkap</label>
                  <textarea
                    name="detailed_description"
                    value={formData.detailed_description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Deskripsi detail termasuk kondisi, spesifikasi, dll..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Harga & Deposit
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Limit Price */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Harga Limit *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">Rp</span>
                      <input
                        type="text"
                        name="limit_price"
                        value={formData.limit_price}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Uang Jaminan *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">Rp</span>
                      <input
                        type="text"
                        name="deposit_amount"
                        value={formData.deposit_amount}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Starting Price */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Harga Pembukaan</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">Rp</span>
                      <input
                        type="text"
                        name="starting_price"
                        value={formData.starting_price}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Increment Amount */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Kelipatan Bid</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">Rp</span>
                      <input
                        type="text"
                        name="increment_amount"
                        value={formData.increment_amount}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                  Gambar
                </h2>

                {/* Add Image URL */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Masukkan URL gambar..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah
                  </button>
                </div>

                {/* Image Gallery */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800">
                          <Image
                            src={img.url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {img.type === "main" && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded-lg">
                            Utama
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          {img.type !== "main" && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(img.id)}
                              className="p-2 bg-emerald-500 rounded-lg text-white text-xs"
                            >
                              Set Utama
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-2 bg-red-500 rounded-lg text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                    <p className="text-zinc-400">Belum ada gambar</p>
                    <p className="text-zinc-500 text-sm">Tambahkan URL gambar di atas</p>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Jadwal Lelang
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Mulai Registrasi</label>
                    <input
                      type="datetime-local"
                      name="registration_start"
                      value={schedule.registration_start}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Akhir Registrasi</label>
                    <input
                      type="datetime-local"
                      name="registration_end"
                      value={schedule.registration_end}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Batas Deposit *</label>
                    <input
                      type="datetime-local"
                      name="deposit_deadline"
                      value={schedule.deposit_deadline}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Tanggal Pengumuman</label>
                    <input
                      type="datetime-local"
                      name="announcement_date"
                      value={schedule.announcement_date}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Mulai Lelang *</label>
                    <input
                      type="datetime-local"
                      name="auction_start"
                      value={schedule.auction_start}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Akhir Lelang *</label>
                    <input
                      type="datetime-local"
                      name="auction_end"
                      value={schedule.auction_end}
                      onChange={handleScheduleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Seller & Organizer */}
            <div className="space-y-6">
              {/* Seller */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Penjual
                </h2>

                <div className="flex gap-2">
                  <select
                    name="seller_id"
                    value={formData.seller_id}
                    onChange={handleInputChange}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Pilih Penjual</option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.seller_name} ({seller.seller_type})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowSellerModal(true)}
                    className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Penyelenggara
                </h2>

                <div className="flex gap-2">
                  <select
                    name="organizer_id"
                    value={formData.organizer_id}
                    onChange={handleInputChange}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Pilih Penyelenggara</option>
                    {organizers.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.organizer_name} ({org.organizer_type})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowOrganizerModal(true)}
                    className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Aksi</h2>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Simpan Draft
                  </button>
                  
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    Simpan & Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tambah Penjual Baru</h3>
              <button onClick={() => setShowSellerModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nama Penjual *</label>
                <input
                  type="text"
                  value={newSeller.seller_name}
                  onChange={(e) => setNewSeller(prev => ({ ...prev, seller_name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Tipe</label>
                <select
                  value={newSeller.seller_type}
                  onChange={(e) => setNewSeller(prev => ({ ...prev, seller_type: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                >
                  {sellerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Telepon</label>
                <input
                  type="tel"
                  value={newSeller.phone}
                  onChange={(e) => setNewSeller(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  value={newSeller.email}
                  onChange={(e) => setNewSeller(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleCreateSeller}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Tambah Penjual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Modal */}
      {showOrganizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tambah Penyelenggara Baru</h3>
              <button onClick={() => setShowOrganizerModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nama Penyelenggara *</label>
                <input
                  type="text"
                  value={newOrganizer.organizer_name}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, organizer_name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Tipe</label>
                <select
                  value={newOrganizer.organizer_type}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, organizer_type: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                >
                  {organizerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Telepon</label>
                <input
                  type="tel"
                  value={newOrganizer.phone}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  value={newOrganizer.email}
                  onChange={(e) => setNewOrganizer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleCreateOrganizer}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Tambah Penyelenggara
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tambah Kategori Baru</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nama Kategori *</label>
                <input
                  type="text"
                  value={newCategory.category_name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, category_name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Deskripsi</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <button
                onClick={handleCreateCategory}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

