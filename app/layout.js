import { Geist, Geist_Mono } from "next/font/google";
import OneSignalMobileOnly from "../components/OneSignalMobileOnly";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "MaCopro",
  description: "…",
  manifest: "/manifest.json",
  themeColor: "#0b63f6",
  appleWebApp: {
    capable: true,
    title: "MaCopro",
    statusBarStyle: "default",
  },
  icons: {
    // Favicons classiques
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      // (optionnel) PWA icons
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    // Icône iOS
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <OneSignalMobileOnly />
        {children}
      </body>
    </html>
  );
}
