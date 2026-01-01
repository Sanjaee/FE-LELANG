import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { createChart, LineSeries, LineData, Time } from "lightweight-charts";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Dummy auction items (same as landing page)
const auctionItems = [
  {
    id: 1,
    name: "Rolex Submariner",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop",
    currentBid: 125000000,
    startingBid: 80000000,
    totalBids: 47,
    timeLeft: "2h 15m",
    description: "Authentic Rolex Submariner Date 116610LN with black dial and ceramic bezel. Complete with box and papers. Excellent condition with minor signs of wear.",
    seller: "LuxuryTimepieces",
  },
  {
    id: 2,
    name: "Vintage Leica M3",
    category: "Camera",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop",
    currentBid: 45000000,
    startingBid: 30000000,
    totalBids: 23,
    timeLeft: "5h 42m",
    description: "Rare Leica M3 double stroke from 1955. Recently CLA'd and in excellent working condition. Comes with original leather case.",
    seller: "VintageCamera",
  },
  {
    id: 3,
    name: "MacBook Pro M3 Max",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
    currentBid: 38500000,
    startingBid: 25000000,
    totalBids: 89,
    timeLeft: "1h 08m",
    description: "Apple MacBook Pro 16\" with M3 Max chip, 64GB RAM, 1TB SSD. Like new condition, only 3 months old with AppleCare+ until 2027.",
    seller: "TechDeals",
  },
  {
    id: 4,
    name: "Hermès Birkin 30",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop",
    currentBid: 285000000,
    startingBid: 200000000,
    totalBids: 156,
    timeLeft: "12h 30m",
    description: "Authentic Hermès Birkin 30 in Togo leather with gold hardware. Pristine condition with original box, dustbag, and receipt.",
    seller: "LuxuryBags",
  },
  {
    id: 5,
    name: "Antique Persian Rug",
    category: "Art",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop",
    currentBid: 67000000,
    startingBid: 45000000,
    totalBids: 12,
    timeLeft: "3d 8h",
    description: "Exquisite handwoven Persian rug from the 19th century. Intricate floral patterns with natural dyes. Museum quality piece.",
    seller: "AntiqueArts",
  },
  {
    id: 6,
    name: "Gibson Les Paul '59",
    category: "Music",
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&h=800&fit=crop",
    currentBid: 890000000,
    startingBid: 700000000,
    totalBids: 34,
    timeLeft: "6h 22m",
    description: "Original 1959 Gibson Les Paul Standard in Cherry Sunburst. All original parts and electronics. One of the holy grails of electric guitars.",
    seller: "VintageGuitars",
  },
  {
    id: 7,
    name: "Air Jordan 1 Chicago",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop",
    currentBid: 28000000,
    startingBid: 18000000,
    totalBids: 201,
    timeLeft: "45m",
    description: "Deadstock 1985 Air Jordan 1 Chicago in original box. Size US 10. Authenticated by StockX.",
    seller: "SneakerVault",
  },
  {
    id: 8,
    name: "Patek Philippe Nautilus",
    category: "Watches",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=800&fit=crop",
    currentBid: 1250000000,
    startingBid: 950000000,
    totalBids: 18,
    timeLeft: "1d 4h",
    description: "Patek Philippe Nautilus 5711/1A-010 Blue Dial. Full set with box and papers. 2020 production, discontinued model.",
    seller: "EliteWatches",
  },
  {
    id: 9,
    name: "Vintage Wine Collection",
    category: "Collectibles",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=800&fit=crop",
    currentBid: 156000000,
    startingBid: 120000000,
    totalBids: 8,
    timeLeft: "2d 12h",
    description: "Collection of 12 bottles of rare vintage wines including Château Margaux 1990, Romanée-Conti 1985, and Pétrus 1982.",
    seller: "FineCellars",
  },
  {
    id: 10,
    name: "Diamond Tennis Bracelet",
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    currentBid: 420000000,
    startingBid: 300000000,
    totalBids: 67,
    timeLeft: "8h 15m",
    description: "18K White Gold tennis bracelet featuring 15 carats of VS1 clarity diamonds. GIA certified. Stunning brilliance.",
    seller: "DiamondHouse",
  },
  {
    id: 11,
    name: "Banksy Original Print",
    category: "Art",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=800&fit=crop",
    currentBid: 750000000,
    startingBid: 500000000,
    totalBids: 42,
    timeLeft: "4h 50m",
    description: "Authenticated Banksy 'Girl with Balloon' signed print. Limited edition 150/600. Pest Control certified.",
    seller: "ContemporaryArt",
  },
  {
    id: 12,
    name: "Sony A7R V",
    category: "Camera",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop",
    currentBid: 52000000,
    startingBid: 40000000,
    totalBids: 31,
    timeLeft: "16h 40m",
    description: "Sony Alpha A7R V full-frame mirrorless camera. Like new condition with only 500 shutter count. Includes extra battery and 128GB CFexpress card.",
    seller: "ProCamera",
  },
];

// User colors for the stacked area chart
const userColors = [
  { line: "#22c55e", area: "rgba(34, 197, 94, 0.3)", name: "User A" },
  { line: "#f97316", area: "rgba(249, 115, 22, 0.4)", name: "User B" },
  { line: "#a855f7", area: "rgba(168, 85, 247, 0.4)", name: "User C" },
  { line: "#06b6d4", area: "rgba(6, 182, 212, 0.3)", name: "User D" },
  { line: "#ef4444", area: "rgba(239, 68, 68, 0.4)", name: "User E" },
  { line: "#3b82f6", area: "rgba(59, 130, 246, 0.3)", name: "User F" },
];

// Generate dummy bid history data for stacked area
interface BidHistoryEntry {
  time: number;
  bidder: string;
  bidderIndex: number;
  amount: number;
  cumulativeByUser: number[];
}

function generateBidHistory(startingBid: number, currentBid: number, totalBids: number): BidHistoryEntry[] {
  const history: BidHistoryEntry[] = [];
  const now = Date.now();
  const startTime = now - 24 * 60 * 60 * 1000; // 24 hours ago
  const baseValue = startingBid / 1000000; // Base value in millions
  
  // Initialize each user with slightly different starting values (racing start)
  const userCumulatives = [
    baseValue * (0.8 + Math.random() * 0.4),
    baseValue * (0.7 + Math.random() * 0.5),
    baseValue * (0.9 + Math.random() * 0.3),
    baseValue * (0.6 + Math.random() * 0.6),
    baseValue * (0.75 + Math.random() * 0.45),
    baseValue * (0.85 + Math.random() * 0.35),
  ];
  
  for (let i = 0; i < totalBids; i++) {
    const timeOffset = (i / totalBids) * (now - startTime);
    
    // Each tick, random users increase their bids with varying amounts
    const numBidders = Math.floor(Math.random() * 4) + 1; // 1-4 users bid each tick
    
    for (let b = 0; b < numBidders; b++) {
      const bidderIndex = Math.floor(Math.random() * 6);
      // Random increment - some users bid more aggressively
      const aggressiveness = 0.5 + Math.random() * 1.5;
      const increment = (baseValue * 0.02 * aggressiveness) + (Math.random() * baseValue * 0.03);
      userCumulatives[bidderIndex] += increment;
    }
    
    // Occasionally add a big jump for drama (someone outbids significantly)
    if (Math.random() > 0.85) {
      const luckyBidder = Math.floor(Math.random() * 6);
      userCumulatives[luckyBidder] += baseValue * 0.1 * (1 + Math.random());
    }
    
    const leadingBidder = userCumulatives.indexOf(Math.max(...userCumulatives));
    
    history.push({
      time: startTime + timeOffset,
      bidder: userColors[leadingBidder].name,
      bidderIndex: leadingBidder,
      amount: Math.round(Math.max(...userCumulatives) * 1000000),
      cumulativeByUser: [...userCumulatives],
    });
  }
  
  return history;
}

// Generate line series data for each user (individual lines, not stacked)
function generateLineSeriesData(history: BidHistoryEntry[]) {
  const userSeriesData: LineData<Time>[][] = Array.from({ length: 6 }, () => []);
  
  history.forEach((entry) => {
    const timeValue = Math.floor(entry.time / 1000) as Time;
    
    // Each user has their own independent line value
    for (let i = 0; i < 6; i++) {
      userSeriesData[i].push({
        time: timeValue,
        value: entry.cumulativeByUser[i], // Individual value, not stacked
      });
    }
  });
  
  return userSeriesData;
}

// Bid history table entry
interface BidEntry {
  id: number;
  bidder: string;
  bidderIndex: number;
  amount: number;
  time: string;
  avatar: string;
}

function generateBidEntries(history: BidHistoryEntry[]): BidEntry[] {
  return history
    .slice(-20) // Last 20 bids
    .reverse()
    .map((h, i) => ({
      id: i,
      bidder: h.bidder,
      bidderIndex: h.bidderIndex,
      amount: h.amount,
      time: formatTimeAgo(h.time),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.bidder}`,
    }));
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(2)}B`;
  }
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function AuctionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRefs = useRef<ReturnType<ReturnType<typeof createChart>["addSeries"]>[]>([]);
  
  const item = auctionItems.find((a) => a.id === Number(id)) || auctionItems[0];
  
  // Initialize data with useMemo to avoid setState in effect
  const initialHistory = useMemo(() => 
    generateBidHistory(item.startingBid, item.currentBid, item.totalBids),
    [item.startingBid, item.currentBid, item.totalBids]
  );
  
  const [_bidHistory, _setBidHistory] = useState<BidHistoryEntry[]>(() => initialHistory);
  const [bidEntries, setBidEntries] = useState<BidEntry[]>(() => generateBidEntries(initialHistory));
  const [currentPrice, setCurrentPrice] = useState(() => item.currentBid);
  const [bidAmount, setBidAmount] = useState(() => Math.round(item.currentBid * 1.05).toString());
  const [activeTab, setActiveTab] = useState<"chart" | "history">("chart");
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#71717a",
        fontFamily: "Outfit, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "rgba(34, 197, 94, 0.3)",
          style: 2,
        },
        horzLine: {
          width: 1,
          color: "rgba(34, 197, 94, 0.3)",
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        vertTouchDrag: true,
      },
    });
    
    chartRef.current = chart;
    
    // Create line series for each user (racing chart - independent lines)
    const lineData = generateLineSeriesData(initialHistory);
    
    for (let i = 0; i < 6; i++) {
      const series = chart.addSeries(LineSeries, {
        color: userColors[i].line,
        lineWidth: 3,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: userColors[i].line,
        crosshairMarkerBackgroundColor: "#0a0b0d",
      });
      
      series.setData(lineData[i]);
      seriesRefs.current[i] = series;
    }
    
    // Find the leading user and add price line
    const lastValues = lineData.map(d => d[d.length - 1]?.value || 0);
    const maxValue = Math.max(...lastValues);
    const leadingUserIndex = lastValues.indexOf(maxValue);
    
    if (seriesRefs.current[leadingUserIndex]) {
      seriesRefs.current[leadingUserIndex].createPriceLine({
        price: maxValue,
        color: userColors[leadingUserIndex].line,
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "Leader",
      });
    }
    
    chart.timeScale().fitContent();
    
    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 400,
        });
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initialHistory]);
  
  // Track cumulative values in a ref to avoid stale closures
  const cumulativesRef = useRef<number[]>([]);
  const currentPriceRef = useRef(currentPrice);
  
  // Initialize cumulatives from initial history
  useEffect(() => {
    if (initialHistory.length > 0) {
      cumulativesRef.current = [...initialHistory[initialHistory.length - 1].cumulativeByUser];
    }
  }, [initialHistory]);
  
  // Keep currentPriceRef in sync
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);
  
  // Simulate real-time bid updates - runs every second (racing simulation)
  useEffect(() => {
    if (!chartRef.current || seriesRefs.current.length === 0) return;
    
    const interval = setInterval(() => {
      if (cumulativesRef.current.length !== 6) return;
      
      // Find current leader
      const currentMax = Math.max(...cumulativesRef.current);
      const leaderIndex = cumulativesRef.current.indexOf(currentMax);
      
      // Random number of bids this tick (2-4 users can bid)
      const numBids = Math.floor(Math.random() * 3) + 2;
      let lastBidderIdx = 0;
      
      for (let b = 0; b < numBids; b++) {
        // Pick random user
        const bidderIndex = Math.floor(Math.random() * 6);
        lastBidderIdx = bidderIndex;
        
        // Base increment varies by user aggressiveness
        const baseIncrement = currentMax * 0.008;
        
        // Users behind the leader bid more aggressively to catch up
        const isTrailing = cumulativesRef.current[bidderIndex] < currentMax * 0.95;
        const aggressiveness = isTrailing ? (1.5 + Math.random() * 1.5) : (0.5 + Math.random());
        
        const increment = baseIncrement * aggressiveness * (0.5 + Math.random());
        cumulativesRef.current[bidderIndex] += increment;
      }
      
      // Occasionally the leader slows down (dramatic tension)
      if (Math.random() > 0.8) {
        // Leader doesn't bid this round - others can catch up
      } else if (Math.random() > 0.7) {
        // Leader makes a big jump
        cumulativesRef.current[leaderIndex] += currentMax * 0.02 * (1 + Math.random());
      }
      
      // Update React state for price display (highest bid is the current price)
      const newMax = Math.max(...cumulativesRef.current);
      setCurrentPrice(newMax * 1000000);
      
      // Update chart with new data point
      const newTime = Math.floor(Date.now() / 1000) as Time;
      
      // Update each series with their individual values (racing lines)
      for (let i = 0; i < 6; i++) {
        seriesRefs.current[i]?.update({
          time: newTime,
          value: cumulativesRef.current[i],
        });
      }
      
      // Add latest bid to entries (show the bidder who just bid)
      const newLeaderIndex = cumulativesRef.current.indexOf(Math.max(...cumulativesRef.current));
      const newEntry: BidEntry = {
        id: Date.now(),
        bidder: userColors[lastBidderIdx].name,
        bidderIndex: lastBidderIdx,
        amount: Math.round(cumulativesRef.current[lastBidderIdx] * 1000000),
        time: "Just now",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userColors[lastBidderIdx].name}`,
      };
      
      // Also show if there's a new leader
      if (newLeaderIndex !== leaderIndex) {
        const leaderEntry: BidEntry = {
          id: Date.now() + 1,
          bidder: `🏆 ${userColors[newLeaderIndex].name} takes the lead!`,
          bidderIndex: newLeaderIndex,
          amount: Math.round(cumulativesRef.current[newLeaderIndex] * 1000000),
          time: "Just now",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userColors[newLeaderIndex].name}`,
        };
        setBidEntries((prev) => [leaderEntry, newEntry, ...prev.slice(0, 27)]);
      } else {
        setBidEntries((prev) => [newEntry, ...prev.slice(0, 29)]);
      }
      
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []); // Empty deps - uses refs for values
  
  return (
    <div className={`${outfit.className} min-h-screen bg-[#0a0b0d]`}>
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 px-4 md:px-6 py-6 max-w-[1600px] mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Auctions
        </Link>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Chart & Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Item Header */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{item.category}</div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{item.name}</h1>
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {item.seller}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-emerald-400 font-medium">{item.timeLeft} left</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {item.totalBids} bids
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Section */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden">
              {/* Chart Tabs */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
                <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("chart")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "chart"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Bid Racing
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === "history"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Bid History
                  </button>
                </div>
                
                {/* Legend */}
                <div className="hidden md:flex items-center gap-4">
                  {userColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color.line }}
                      />
                      <span className="text-xs text-zinc-500">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chart Container - use CSS display instead of unmounting */}
              <div className={`p-4 ${activeTab === "chart" ? "block" : "hidden"}`}>
                <div ref={chartContainerRef} className="w-full h-[400px]" />
                
                {/* Mobile Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-4 md:hidden">
                  {userColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color.line }}
                      />
                      <span className="text-xs text-zinc-500">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bid History Table */}
              <div className={`max-h-[450px] overflow-y-auto ${activeTab === "history" ? "block" : "hidden"}`}>
                  <table className="w-full">
                    <thead className="sticky top-0 bg-zinc-900">
                      <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Bidder</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {bidEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: userColors[entry.bidderIndex].line }}
                              >
                                {entry.bidder.charAt(5)}
                              </div>
                              <span className="text-white font-medium">{entry.bidder}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-emerald-400 font-semibold">
                              {formatCurrency(entry.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-500 text-sm">
                            {entry.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
          
          {/* Right Column - Bidding Panel */}
          <div className="space-y-6">
            {/* Current Price Card */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
              <div className="text-sm text-zinc-500 mb-2">Current Bid</div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {formatCurrency(currentPrice)}
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                +{((currentPrice - item.startingBid) / item.startingBid * 100).toFixed(1)}% from start
              </div>
              
              <div className="mt-6 pt-6 border-t border-zinc-800/50">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-zinc-500">Starting Bid</span>
                  <span className="text-white">{formatCurrency(item.startingBid)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-zinc-500">Total Bids</span>
                  <span className="text-white">{item.totalBids}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Time Left</span>
                  <span className="text-emerald-400 font-medium">{item.timeLeft}</span>
                </div>
              </div>
            </div>
            
            {/* Place Bid Card */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Place Your Bid</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-500 mb-2">Your Bid Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">Rp</span>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">
                    Minimum bid: {formatCurrency(Math.round(currentPrice * 1.01))}
                  </div>
                </div>
                
                {/* Quick Bid Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[1.05, 1.1, 1.2].map((multiplier) => (
                    <button
                      key={multiplier}
                      onClick={() => setBidAmount(Math.round(currentPrice * multiplier).toString())}
                      className="py-2 px-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 text-sm hover:border-zinc-600 hover:text-white transition-all"
                    >
                      +{Math.round((multiplier - 1) * 100)}%
                    </button>
                  ))}
                </div>
                
                <button className="w-full py-4 bg-linear-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 active:scale-[0.98]">
                  Place Bid
                </button>
                
                <p className="text-xs text-zinc-500 text-center">
                  By placing a bid, you agree to our terms and conditions
                </p>
              </div>
            </div>
            
            {/* Recent Bidders */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Bidders</h3>
              
              <div className="flex flex-wrap gap-2">
                {userColors.map((color, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-700/50"
                    style={{ borderColor: `${color.line}50` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: color.line }}
                    >
                      {color.name.charAt(5)}
                    </div>
                    <span className="text-sm text-zinc-300">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

