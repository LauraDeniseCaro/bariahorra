import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
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
  manifest: "/manifest.json", // <-- OBLIGATORIO para que el navegador dispare la instalación
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bariahorra",
  },
};

export const viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="min-h-full flex flex-col bg-[#0d131f] select-none text-slate-100">
        <div className="min-h-screen bg-[#0d131f] flex justify-center selection:bg-sky-500 selection:text-white">
          <div className="w-full max-w-md bg-[#121826] min-h-screen flex flex-col border-x border-slate-800/80 shadow-2xl relative pb-20">
            <Header />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}