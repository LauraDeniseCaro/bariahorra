import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bariahorra - Precios en Bariloche",
  description: "Compará y encontrá los mejores precios de supermercados en Bariloche.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bariahorra",
  },
};

export const viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-sky-500 selection:text-white">
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto border-x border-slate-800/60 shadow-2xl bg-[#0f1523] min-h-screen">
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <BottomNav />
          <Footer />
        </div>
      </body>
    </html>
  );
}