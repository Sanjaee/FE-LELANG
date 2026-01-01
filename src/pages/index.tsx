import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Dummy auction data
const auctionItems = [
  {
    id: 1,
    name: "Rolex Submariner",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
    currentBid: 125000000,
    previousBid: 120000000,
    totalBids: 47,
    timeLeft: "2h 15m",
    isHot: true,
  },
  {
    id: 2,
    name: "Vintage Leica M3",
    category: "Camera",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    currentBid: 45000000,
    previousBid: 48000000,
    totalBids: 23,
    timeLeft: "5h 42m",
    isHot: false,
  },
  {
    id: 3,
    name: "MacBook Pro M3 Max",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    currentBid: 38500000,
    previousBid: 35000000,
    totalBids: 89,
    timeLeft: "1h 08m",
    isHot: true,
  },
  {
    id: 4,
    name: "Hermès Birkin 30",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    currentBid: 285000000,
    previousBid: 280000000,
    totalBids: 156,
    timeLeft: "12h 30m",
    isHot: true,
  },
  {
    id: 5,
    name: "Antique Persian Rug",
    category: "Art",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=400&fit=crop",
    currentBid: 67000000,
    previousBid: 70000000,
    totalBids: 12,
    timeLeft: "3d 8h",
    isHot: false,
  },
  {
    id: 6,
    name: "Gibson Les Paul '59",
    category: "Music",
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=400&fit=crop",
    currentBid: 890000000,
    previousBid: 850000000,
    totalBids: 34,
    timeLeft: "6h 22m",
    isHot: true,
  },
  {
    id: 7,
    name: "Air Jordan 1 Chicago",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop",
    currentBid: 28000000,
    previousBid: 25000000,
    totalBids: 201,
    timeLeft: "45m",
    isHot: true,
  },
  {
    id: 8,
    name: "Patek Philippe Nautilus",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=400&fit=crop",
    currentBid: 1250000000,
    previousBid: 1200000000,
    totalBids: 18,
    timeLeft: "1d 4h",
    isHot: true,
  },
  {
    id: 9,
    name: "Vintage Wine Collection",
    category: "Collectibles",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=400&fit=crop",
    currentBid: 156000000,
    previousBid: 160000000,
    totalBids: 8,
    timeLeft: "2d 12h",
    isHot: false,
  },
  {
    id: 10,
    name: "Diamond Tennis Bracelet",
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    currentBid: 420000000,
    previousBid: 400000000,
    totalBids: 67,
    timeLeft: "8h 15m",
    isHot: true,
  },
  {
    id: 11,
    name: "Banksy Original Print",
    category: "Art",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop",
    currentBid: 750000000,
    previousBid: 720000000,
    totalBids: 42,
    timeLeft: "4h 50m",
    isHot: true,
  },
  {
    id: 12,
    name: "Sony A7R V",
    category: "Camera",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    currentBid: 52000000,
    previousBid: 55000000,
    totalBids: 31,
    timeLeft: "16h 40m",
    isHot: false,
  },
];

const categories = ["All", "Watches", "Fashion", "Electronics", "Art", "Camera", "Music", "Jewelry", "Collectibles"];

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(0)}M`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getPriceChange(current: number, previous: number): { percentage: string; isUp: boolean } {
  const change = ((current - previous) / previous) * 100;
  return {
    percentage: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
    isUp: change >= 0,
  };
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = auctionItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-[1600px] mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-medium">Live Auctions</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Premium <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">Auction</span> House
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Discover rare collectibles, luxury items, and exclusive pieces. Bid in real-time.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Auctions", value: "1,247", icon: "🔥" },
            { label: "Total Volume", value: "Rp 89.2B", icon: "💎" },
            { label: "Active Bidders", value: "12,841", icon: "👥" },
            { label: "Avg. Bid Increase", value: "+8.4%", icon: "📈" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 text-center hover:border-zinc-700/50 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-zinc-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-1.5">
            <button className="p-2 rounded-lg bg-zinc-800 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-lg text-zinc-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-zinc-900/50 text-zinc-400 border border-zinc-800/50 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item, index) => {
            const priceChange = getPriceChange(item.currentBid, item.previousBid);
            return (
              <Link
                href={`/${item.id}`}
                key={item.id}
                className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hot Badge */}
                {item.isHot && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-semibold shadow-lg">
                    <span className="text-[10px]">🔥</span> HOT
                  </div>
                )}

                {/* Time Badge */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item.timeLeft}
                </div>

                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent z-10" />
            <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category */}
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{item.category}</div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </h3>

                  {/* Price Section */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Current Bid</div>
                      <div className="text-xl font-bold text-white">{formatCurrency(item.currentBid)}</div>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold ${
                        priceChange.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${priceChange.isUp ? "" : "rotate-180"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {priceChange.percentage}
                    </div>
                  </div>

                  {/* Bid Stats & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {item.totalBids} bids
                    </div>
                    <button className="px-4 py-2 bg-linear-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 active:scale-95">
                      Place Bid
                    </button>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No auctions found</h3>
            <p className="text-zinc-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More */}
        {filteredItems.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3.5 bg-zinc-900/50 border border-zinc-800/50 text-white font-medium rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-300">
              Load More Auctions
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-zinc-800/50">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
            <span>© 2025 Premium Auction House</span>
            <span>•</span>
            <span>Trusted by 50,000+ collectors</span>
            <span>•</span>
            <span>$2.1B+ in total sales</span>
          </div>
        </div>
      </div>
    </div>
  );
}
