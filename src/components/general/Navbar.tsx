"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Gavel } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: router.asPath });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
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
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-[#0a0b0d]/95 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
              Lelang
            </span>
            <span className="text-[10px] text-zinc-500 -mt-1">Premium Auction</span>
          </div>
        </Link>

        {/* Center - Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              router.pathname === "/"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/my-bids"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              router.pathname === "/my-bids"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            My Bids
          </Link>
          <Link
            href="/sell"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              router.pathname === "/sell"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            Sell
          </Link>
        </div>

        {/* Right side - Auth buttons */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-zinc-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <Avatar className="h-9 w-9 ring-2 ring-emerald-500/50">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-emerald-500 text-white text-sm font-semibold">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {session.user.name?.split(" ")[0] || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                <DropdownMenuLabel className="flex flex-col space-y-1 p-0">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-emerald-500 text-white">
                        {getInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-white">
                        {session.user.name || "User"}
                      </span>
                      {session.user.email && (
                        <span className="text-xs font-normal text-zinc-400">
                          {session.user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer text-zinc-300 hover:text-white focus:bg-zinc-800"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer text-zinc-300 hover:text-white focus:bg-zinc-800"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-400 hover:text-red-300 focus:bg-zinc-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

