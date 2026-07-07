import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SwRegister } from "@/components/layout/sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Manhaj — Ilm, organized.",
    template: "%s — Manhaj",
  },
  description:
    "A focused audio lecture platform for Nigerian Sunni/Salafi scholars. Stream, download, and organize lectures from trusted scholars.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Manhaj — Ilm, organized.",
    description:
      "Stream and download audio lectures from trusted Nigerian Sunni/Salafi scholars.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a6b3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoNaskhArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-sand-50 text-forest-900 font-sans dark:bg-ink-950 dark:text-ink-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster position="top-center" theme="system" />
        <SwRegister />
      </body>
    </html>
  );
}
