import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bariahorra.vercel.app'),
  title: "BariAhorra - Precios de Supermercados en Bariloche",
  description: "Compará precios entre La Anónima, Todo, ChangoMás y comercios de barrio en Bariloche. Cuidemos el bolsillo juntos.",
  keywords: ["precios bariloche", "supermercados bariloche", "ahorro bariloche", "la anonima", "supermercado todo", "changomas"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BariAhorra",
  },
  openGraph: {
    title: "BariAhorra - Precios en Bariloche",
    description: "Compará precios en góndola entre súper y comercios de Bariloche. Aportes en tiempo real de la comunidad.",
    url: "https://bariahorra.vercel.app",
    siteName: "BariAhorra",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Logo BariAhorra",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BariAhorra - Precios en Bariloche",
    description: "Compará precios y encontrá los mejores valores en góndola de Bariloche.",
    images: ["/icon-512.png"],
  },
};

export const viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "BariAhorra",
  "url": "https://bariahorra.vercel.app",
  "description": "Comparador comunitario de precios de supermercados y comercios en San Carlos de Bariloche.",
  "applicationCategory": "ShoppingApplication",
  "operatingSystem": "All",
  "inLanguage": "es-AR",
  "areaServed": {
    "@type": "City",
    "name": "San Carlos de Bariloche",
    "addressRegion": "Río Negro",
    "addressCountry": "AR"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "ARS"
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon-192.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col selection:bg-sky-500 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Contenedor adaptativo según el tema activo */}
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto border-x shadow-2xl theme-shell min-h-screen">
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </div>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-KT559ED6VW"} />
      </body>
    </html>
  );
}