import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortune Wheel",
  description: "Spin the wheel and win!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <nav className="bg-red-600 text-white shadow-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <span className="font-bold text-xl tracking-tight">Fortune Wheel</span>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/manage"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Manage Options
                </Link>
                <Link
                  href="/results"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
