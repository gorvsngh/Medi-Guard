import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedGuard - Emergency Health Platform",
  description: "Instant access to critical medical information in emergencies. QR code-based emergency health platform for first responders.",
  keywords: "emergency, medical, health, first responders, QR code, medical alert, emergency contacts",
  authors: [{ name: "MedGuard Team" }],
  robots: "index, follow",
  openGraph: {
    title: "MedGuard - Emergency Health Platform",
    description: "Instant access to critical medical information in emergencies",
    type: "website",
    locale: "en_US",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedGuard" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
