import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/lib/loading-context";
import GlobalLoader from "@/components/ui/GlobalLoader";
import StructuredData from "@/components/seo/StructuredData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WebVitals } from "./web-vitals";
import ScrollProgress from "@/components/ui/ScrollProgress";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://autamedica.com'),
  title: {
    default: "AutaMedica - Telemedicina sin fricciones",
    template: "%s | AutaMedica"
  },
  description:
    "Plataforma de telemedicina innovadora. Conecta con profesionales de la salud, agenda consultas inmediatas y recibe atención médica de calidad. Tecnología segura HIPAA-compliant.",
  keywords: [
    "telemedicina",
    "consulta virtual",
    "médico online",
    "salud digital",
    "consultas online",
    "HIPAA",
    "AutaMedica",
    "receta digital",
    "historia clínica digital",
    "inteligencia artificial médica",
    "telemedicina Argentina",
    "consulta médica virtual"
  ],
  authors: [{ name: "E.M Medicina - UBA", url: "https://autamedica.com" }],
  creator: "E.M Medicina - UBA",
  publisher: "AutaMedica",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://autamedica.com",
    siteName: "AutaMedica",
    title: "AutaMedica - Telemedicina sin fricciones",
    description: "Agenda inmediata, receta digital al finalizar y resultados en tu móvil. Plataforma de telemedicina HIPAA-compliant.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AutaMedica - Telemedicina sin fricciones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@autamedica",
    creator: "@autamedica",
    title: "AutaMedica - Telemedicina sin fricciones",
    description: "Agenda inmediata, receta digital al finalizar y resultados en tu móvil",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://autamedica.com",
    languages: {
      'es-AR': 'https://autamedica.com',
      'es': 'https://autamedica.com',
    },
  },
  category: 'health',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <StructuredData />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AutaMedica" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
      </head>
      <body className="antialiased">
        <ScrollProgress />
        <WebVitals />
        <ErrorBoundary>
          <LoadingProvider>
            {children}
            <GlobalLoader />
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
