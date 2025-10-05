import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://auth.autamedica.com'),
  title: {
    default: "AutaMedica Auth Hub - Acceso Seguro",
    template: "%s | AutaMedica Auth"
  },
  description: "Centro de autenticación segura HIPAA-compliant para el ecosistema AutaMedica. Acceso unificado para médicos, pacientes y empresas.",
  keywords: [
    "AutaMedica",
    "autenticación médica",
    "login seguro",
    "HIPAA compliant",
    "auth hub",
    "acceso médicos",
    "acceso pacientes",
    "telemedicina segura"
  ],
  authors: [{ name: "E.M Medicina - UBA", url: "https://autamedica.com" }],
  creator: "E.M Medicina - UBA",
  publisher: "AutaMedica",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://auth.autamedica.com",
    siteName: "AutaMedica Auth Hub",
    title: "AutaMedica Auth Hub - Acceso Seguro",
    description: "Centro de autenticación segura para el ecosistema AutaMedica",
  },
  alternates: {
    canonical: "https://auth.autamedica.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AutaMedica Auth" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <AuthProvider enableDebug={process.env.NODE_ENV === 'development'}>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}