"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Outfit } from "next/font/google";
import Image from "next/image";
import {
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  QrCode,
  Building2,
  RefreshCw,
  Home,
} from "lucide-react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

interface PaymentData {
  transactionId: string;
  amount: number;
  method: "qris" | "va";
  bank: string | null;
  status: "pending" | "success" | "expired" | "failed";
  createdAt: string;
  expiresAt: string;
  vaNumber: string | null;
}

// Dummy QRIS image (using a placeholder)
const DUMMY_QRIS_URL = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126670016COM.NOBUBANK.WWW01teledomokimeltelefono0215NOABORIBAHANNEA520454995303360540850000000000005802ID5920TOKO%20DUMMY%20LELANG6013JAKARTA%20PUSAT61051034062070703A016304E5F3";

// Bank logos
const bankLogos: Record<string, string> = {
  bca: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png",
  bni: "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png",
  bri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/200px-BANK_BRI_logo.svg.png",
  mandiri: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(expiresAt: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
}

export default function PaymentPage() {
  const router = useRouter();
  const { id } = router.query;
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      // Load payment data from localStorage
      const storedData = localStorage.getItem(`payment_${id}`);
      if (storedData) {
        const data = JSON.parse(storedData) as PaymentData;
        setPaymentData(data);
      }
      setLoading(false);
    }
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!paymentData || paymentData.status !== "pending") return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(paymentData.expiresAt);
      setTimeRemaining(remaining);

      if (remaining.expired) {
        // Update status to expired
        const updatedData = { ...paymentData, status: "expired" as const };
        setPaymentData(updatedData);
        localStorage.setItem(`payment_${id}`, JSON.stringify(updatedData));
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData, id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckStatus = () => {
    setCheckingStatus(true);
    // Simulate checking payment status
    setTimeout(() => {
      // For demo, randomly mark as success
      if (Math.random() > 0.5 && paymentData) {
        const updatedData = { ...paymentData, status: "success" as const };
        setPaymentData(updatedData);
        localStorage.setItem(`payment_${id}`, JSON.stringify(updatedData));
      }
      setCheckingStatus(false);
    }, 2000);
  };

  const handleSimulateSuccess = () => {
    if (paymentData) {
      const updatedData = { ...paymentData, status: "success" as const };
      setPaymentData(updatedData);
      localStorage.setItem(`payment_${id}`, JSON.stringify(updatedData));
    }
  };

  if (loading) {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className={`${outfit.className} min-h-screen bg-[#0a0b0d] flex items-center justify-center`}>
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pembayaran Tidak Ditemukan</h2>
          <p className="text-zinc-400 mb-6">Data pembayaran tidak ditemukan atau sudah kadaluarsa</p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
          >
            Kembali ke Profil
          </button>
        </div>
      </div>
    );
  }

  const isPending = paymentData.status === "pending";
  const isSuccess = paymentData.status === "success";
  const isExpired = paymentData.status === "expired";
  const isFailed = paymentData.status === "failed";

  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 py-8 max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Profil</span>
        </button>

        {/* Main Card */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-6 text-center ${
              isSuccess
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"
                : isExpired || isFailed
                ? "bg-gradient-to-r from-red-500/20 to-orange-500/20"
                : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20"
            }`}
          >
            {isPending && (
              <>
                <Clock className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-white mb-1">Menunggu Pembayaran</h1>
                <p className="text-zinc-400 text-sm">Selesaikan pembayaran sebelum waktu habis</p>
              </>
            )}
            {isSuccess && (
              <>
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-white mb-1">Pembayaran Berhasil</h1>
                <p className="text-zinc-400 text-sm">Saldo Anda telah ditambahkan</p>
              </>
            )}
            {(isExpired || isFailed) && (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-3" />
                <h1 className="text-2xl font-bold text-white mb-1">
                  {isExpired ? "Pembayaran Kadaluarsa" : "Pembayaran Gagal"}
                </h1>
                <p className="text-zinc-400 text-sm">
                  {isExpired ? "Batas waktu pembayaran telah habis" : "Terjadi kesalahan pada pembayaran"}
                </p>
              </>
            )}
          </div>

          {/* Timer (for pending) */}
          {isPending && !timeRemaining.expired && (
            <div className="p-4 bg-amber-500/10 border-y border-amber-500/20">
              <p className="text-center text-amber-400 text-sm mb-2">Selesaikan pembayaran dalam</p>
              <div className="flex justify-center gap-2">
                <div className="bg-zinc-800 rounded-lg px-3 py-2 min-w-[60px] text-center">
                  <span className="text-2xl font-bold text-white">{String(timeRemaining.hours).padStart(2, "0")}</span>
                  <p className="text-xs text-zinc-500">Jam</p>
                </div>
                <span className="text-2xl font-bold text-zinc-500 self-start pt-2">:</span>
                <div className="bg-zinc-800 rounded-lg px-3 py-2 min-w-[60px] text-center">
                  <span className="text-2xl font-bold text-white">{String(timeRemaining.minutes).padStart(2, "0")}</span>
                  <p className="text-xs text-zinc-500">Menit</p>
                </div>
                <span className="text-2xl font-bold text-zinc-500 self-start pt-2">:</span>
                <div className="bg-zinc-800 rounded-lg px-3 py-2 min-w-[60px] text-center">
                  <span className="text-2xl font-bold text-white">{String(timeRemaining.seconds).padStart(2, "0")}</span>
                  <p className="text-xs text-zinc-500">Detik</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(paymentData.amount)}</p>
            </div>

            {/* Payment Method Info */}
            {isPending && (
              <>
                {paymentData.method === "qris" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-zinc-400 mb-4">
                      <QrCode className="w-5 h-5" />
                      <span className="font-medium">Scan QRIS</span>
                    </div>
                    
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                      <Image
                        src={DUMMY_QRIS_URL}
                        alt="QRIS Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        unoptimized
                      />
                    </div>

                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <p className="text-sm text-zinc-400 text-center">
                        Scan QR code di atas menggunakan aplikasi e-wallet seperti GoPay, OVO, DANA, ShopeePay, atau aplikasi mobile banking
                      </p>
                    </div>
                  </div>
                )}

                {paymentData.method === "va" && paymentData.vaNumber && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {paymentData.bank && bankLogos[paymentData.bank] && (
                        <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                          <Image
                            src={bankLogos[paymentData.bank]}
                            alt={paymentData.bank}
                            width={48}
                            height={28}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      <span className="text-white font-medium uppercase">{paymentData.bank} Virtual Account</span>
                    </div>

                    {/* VA Number */}
                    <div className="bg-zinc-800 rounded-xl p-4">
                      <p className="text-xs text-zinc-500 mb-2">Nomor Virtual Account</p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-xl font-mono font-bold text-white tracking-wider">
                          {paymentData.vaNumber}
                        </code>
                        <button
                          onClick={() => handleCopy(paymentData.vaNumber!)}
                          className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-zinc-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <h4 className="text-white font-medium mb-3">Cara Pembayaran:</h4>
                      <ol className="space-y-2 text-sm text-zinc-400">
                        <li className="flex gap-2">
                          <span className="text-emerald-400">1.</span>
                          Buka aplikasi {paymentData.bank?.toUpperCase()} Mobile atau Internet Banking
                        </li>
                        <li className="flex gap-2">
                          <span className="text-emerald-400">2.</span>
                          Pilih menu Transfer &gt; Virtual Account
                        </li>
                        <li className="flex gap-2">
                          <span className="text-emerald-400">3.</span>
                          Masukkan nomor Virtual Account di atas
                        </li>
                        <li className="flex gap-2">
                          <span className="text-emerald-400">4.</span>
                          Konfirmasi dan selesaikan pembayaran
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Transaction Info */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">ID Transaksi</span>
                <span className="text-white font-mono">{paymentData.transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Metode</span>
                <span className="text-white flex items-center gap-2">
                  {paymentData.method === "qris" ? (
                    <>
                      <QrCode className="w-4 h-4" /> QRIS
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" /> VA {paymentData.bank?.toUpperCase()}
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Dibuat</span>
                <span className="text-white">{formatDateTime(paymentData.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Batas Waktu</span>
                <span className={isExpired ? "text-red-400" : "text-white"}>
                  {formatDateTime(paymentData.expiresAt)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSuccess
                      ? "bg-emerald-500/10 text-emerald-400"
                      : isPending
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isSuccess ? "Berhasil" : isPending ? "Menunggu" : isExpired ? "Kadaluarsa" : "Gagal"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {isPending && (
                <>
                  <button
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkingStatus ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Memeriksa...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Cek Status Pembayaran
                      </>
                    )}
                  </button>

                  {/* Demo button to simulate success */}
                  <button
                    onClick={handleSimulateSuccess}
                    className="w-full py-3 bg-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700 transition-all text-sm"
                  >
                    🧪 Simulasi Pembayaran Berhasil (Demo)
                  </button>
                </>
              )}

              {isSuccess && (
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Kembali ke Profil
                </button>
              )}

              {(isExpired || isFailed) && (
                <>
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                  >
                    Top Up Lagi
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full py-3 bg-zinc-800 text-zinc-300 font-medium rounded-xl hover:bg-zinc-700 transition-all"
                  >
                    Kembali ke Profil
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Butuh bantuan?{" "}
          <a href="#" className="text-emerald-400 hover:text-emerald-300">
            Hubungi Customer Service
          </a>
        </p>
      </div>
    </div>
  );
}

