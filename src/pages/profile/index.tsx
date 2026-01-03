"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Outfit } from "next/font/google";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Shield,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  Settings,
  BadgeCheck,
  Copy,
  ChevronRight,
  QrCode,
  Building2,
  Check,
  Loader2,
} from "lucide-react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Dummy user data (will be replaced with session data if available)
const dummyUserData = {
  id: "USR-001",
  email: "johndoe@example.com",
  full_name: "John Doe",
  phone: "+62 812 3456 7890",
  id_card_number: "3201****5678",
  id_card_type: "KTP",
  address: "Jl. Sudirman No. 123",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postal_code: "12190",
  is_verified: true,
  balance: 15750000,
  status: "active",
  created_at: "2024-06-15T10:30:00Z",
  profile_photo: null,
};

// Dummy transaction history
const recentTransactions = [
  {
    id: 1,
    type: "deposit",
    amount: 5000000,
    description: "Top Up via BCA Virtual Account",
    date: "2024-01-02T14:30:00Z",
    status: "completed",
  },
  {
    id: 2,
    type: "bid",
    amount: -2500000,
    description: "Bid: Rolex Submariner",
    date: "2024-01-02T11:15:00Z",
    status: "completed",
  },
  {
    id: 3,
    type: "refund",
    amount: 1500000,
    description: "Refund: Outbid on Vintage Leica",
    date: "2024-01-01T16:45:00Z",
    status: "completed",
  },
  {
    id: 4,
    type: "deposit",
    amount: 10000000,
    description: "Top Up via Mandiri",
    date: "2023-12-28T09:00:00Z",
    status: "completed",
  },
];

// Quick stats
const quickStats = [
  { label: "Total Bids", value: "47", icon: "🎯" },
  { label: "Auctions Won", value: "8", icon: "🏆" },
  { label: "Active Bids", value: "3", icon: "⏳" },
  { label: "Watchlist", value: "12", icon: "👁️" },
];

// Top up amount presets
const topUpAmounts = [
  { value: 100000, label: "Rp 100.000" },
  { value: 250000, label: "Rp 250.000" },
  { value: 500000, label: "Rp 500.000" },
  { value: 1000000, label: "Rp 1.000.000" },
  { value: 2500000, label: "Rp 2.500.000" },
  { value: 5000000, label: "Rp 5.000.000" },
];

// Bank options for VA
const bankOptions = [
  { id: "bca", name: "BCA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png" },
  { id: "bni", name: "BNI", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png" },
  { id: "bri", name: "BRI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/200px-BANK_BRI_logo.svg.png" },
  { id: "mandiri", name: "Mandiri", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

type PaymentMethod = "qris" | "va" | null;
type DialogStep = "amount" | "method" | "bank" | "processing";

export default function ProfileDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // Top up dialog state
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [_paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [_isProcessing, setIsProcessing] = useState(false);

  // Use session data if available, otherwise use dummy data
  const userData = {
    ...dummyUserData,
    full_name: session?.user?.name || dummyUserData.full_name,
    email: session?.user?.email || dummyUserData.email,
    profile_photo: session?.user?.image || dummyUserData.profile_photo,
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(userData.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTopUp = () => {
    setShowTopUpDialog(true);
    setDialogStep("amount");
    setSelectedAmount(0);
    setCustomAmount("");
    setPaymentMethod(null);
    setSelectedBank(null);
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setCustomAmount(numericValue);
    setSelectedAmount(0);
  };

  const getFinalAmount = () => {
    if (customAmount) {
      return parseInt(customAmount) || 0;
    }
    return selectedAmount;
  };

  const handleContinueToMethod = () => {
    if (getFinalAmount() >= 10000) {
      setDialogStep("method");
    }
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "qris") {
      // For QRIS, go directly to processing
      handleProcessPayment(method, null);
    } else if (method === "va") {
      // For VA, show bank selection
      setDialogStep("bank");
    }
  };

  const handleSelectBank = (bankId: string) => {
    setSelectedBank(bankId);
  };

  const handleProcessPayment = (method: PaymentMethod, bankId: string | null) => {
    setIsProcessing(true);
    setDialogStep("processing");
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate dummy transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Store payment data in localStorage for the payment page
      const paymentData = {
        transactionId,
        amount: getFinalAmount(),
        method: method,
        bank: bankId,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        vaNumber: bankId ? `${bankId.toUpperCase()}${Math.random().toString().substring(2, 18)}` : null,
      };
      
      localStorage.setItem(`payment_${transactionId}`, JSON.stringify(paymentData));
      
      // Redirect to payment page
      setShowTopUpDialog(false);
      router.push(`/payment/${transactionId}`);
    }, 1500);
  };

  const handleConfirmBank = () => {
    if (selectedBank) {
      handleProcessPayment("va", selectedBank);
    }
  };

  if (status === "loading") {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 py-8 pt-8 max-w-[1400px] mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-emerald-500/30">
                <AvatarImage
                  src={userData.profile_photo || undefined}
                  alt={userData.full_name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-2xl font-bold">
                  {getInitials(userData.full_name, userData.email)}
                </AvatarFallback>
              </Avatar>
              {userData.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{userData.full_name}</h1>
                {userData.is_verified && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 mb-3">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">ID: {userData.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
                </button>
                {copied && <span className="text-xs text-emerald-400">Copied!</span>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all text-sm font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-zinc-900/50 backdrop-blur-sm border border-emerald-500/20 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-400 text-sm font-medium">Saldo Tersedia</span>
                </div>

                <div className="mb-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {formatCurrency(userData.balance)}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Updated just now
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleOpenTopUp}
                    className="flex-1 min-w-[140px] px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Top Up Saldo
                  </button>
                  <button className="flex-1 min-w-[140px] px-5 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
                    <History className="w-5 h-5" />
                    Riwayat
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 text-center hover:border-zinc-700/50 transition-all"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-zinc-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white">Transaksi Terakhir</h3>
                <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-1">
                  Lihat Semua
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-zinc-800/50">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        tx.type === "deposit" || tx.type === "refund"
                          ? "bg-emerald-500/10"
                          : "bg-orange-500/10"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "refund" ? (
                        <ArrowDownLeft
                          className={`w-5 h-5 ${
                            tx.type === "refund" ? "text-blue-400" : "text-emerald-400"
                          }`}
                        />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-orange-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-zinc-500 text-xs">{formatDateTime(tx.date)}</p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          tx.amount > 0 ? "text-emerald-400" : "text-orange-400"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white">Informasi Pribadi</h3>
                <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                  Edit
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Nama Lengkap</p>
                    <p className="text-white text-sm font-medium">{userData.full_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <Mail className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Email</p>
                    <p className="text-white text-sm font-medium">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <Phone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Nomor Telepon</p>
                    <p className="text-white text-sm font-medium">{userData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Identitas ({userData.id_card_type})</p>
                    <p className="text-white text-sm font-medium">{userData.id_card_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Member Sejak</p>
                    <p className="text-white text-sm font-medium">{formatDate(userData.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white">Alamat</h3>
                <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                  Edit
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800/50">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">{userData.address}</p>
                    <p className="text-zinc-400 text-sm">
                      {userData.city}, {userData.province}
                    </p>
                    <p className="text-zinc-500 text-sm">{userData.postal_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white">Status Akun</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Shield className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 text-sm">Verifikasi Identitas</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      userData.is_verified
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {userData.is_verified ? "Terverifikasi" : "Belum Verifikasi"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800/50">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-zinc-300 text-sm">Status Akun</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      userData.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : userData.status === "suspended"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {userData.status === "active" ? "Aktif" : userData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Up Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          {/* Step 1: Select Amount */}
          {dialogStep === "amount" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  Top Up Saldo
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Pilih atau masukkan nominal top up
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Amount presets */}
                <div className="grid grid-cols-3 gap-2">
                  {topUpAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => handleSelectAmount(amount.value)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        selectedAmount === amount.value
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Atau masukkan nominal lain</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">Rp</span>
                    <input
                      type="text"
                      value={customAmount ? parseInt(customAmount).toLocaleString("id-ID") : ""}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Minimal top up Rp 10.000</p>
                </div>

                {/* Total */}
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Top Up</span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(getFinalAmount())}
                    </span>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={handleContinueToMethod}
                  disabled={getFinalAmount() < 10000}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjutkan
                </button>
              </div>
            </>
          )}

          {/* Step 2: Select Payment Method */}
          {dialogStep === "method" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Pilih Metode Pembayaran</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Total: {formatCurrency(getFinalAmount())}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {/* QRIS Option */}
                <button
                  onClick={() => handleSelectPaymentMethod("qris")}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500/50 rounded-xl transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-semibold">QRIS</h4>
                    <p className="text-zinc-400 text-sm">Scan QR dengan e-wallet apapun</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </button>

                {/* VA Bank Option */}
                <button
                  onClick={() => handleSelectPaymentMethod("va")}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500/50 rounded-xl transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-semibold">Virtual Account</h4>
                    <p className="text-zinc-400 text-sm">Transfer via ATM, Mobile/Internet Banking</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <button
                onClick={() => setDialogStep("amount")}
                className="w-full mt-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                ← Kembali
              </button>
            </>
          )}

          {/* Step 3: Select Bank (for VA) */}
          {dialogStep === "bank" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">Pilih Bank</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Total: {formatCurrency(getFinalAmount())}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 mt-4">
                {bankOptions.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleSelectBank(bank.id)}
                    className={`w-full p-4 border rounded-xl transition-all flex items-center gap-4 ${
                      selectedBank === bank.id
                        ? "bg-emerald-500/10 border-emerald-500"
                        : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center overflow-hidden">
                      <Image
                        src={bank.logo}
                        alt={bank.name}
                        width={40}
                        height={24}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="flex-1 text-left text-white font-medium">{bank.name}</span>
                    {selectedBank === bank.id && (
                      <Check className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setDialogStep("method")}
                  className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmBank}
                  disabled={!selectedBank}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjutkan
                </button>
              </div>
            </>
          )}

          {/* Step 4: Processing */}
          {dialogStep === "processing" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Memproses Pembayaran</h3>
              <p className="text-zinc-400 text-sm">Mohon tunggu sebentar...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
