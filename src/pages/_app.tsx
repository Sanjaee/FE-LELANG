import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { ApiProvider } from "@/components/contex/ApiProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/general/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pages where Navbar should be hidden
const authPages = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/verify-otp",
  "/auth/verify-otp-reset",
  "/auth/verify-reset-password",
];

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();
  const showNavbar = !authPages.includes(router.pathname);

  return (
    <div className={cn(geistSans.variable, geistMono.variable)}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SessionProvider session={session}>
          <ApiProvider>
            {showNavbar && <Navbar />}
            <Component {...pageProps} />
            <Toaster />
          </ApiProvider>
        </SessionProvider>
      </ThemeProvider>
    </div>
  );
}
