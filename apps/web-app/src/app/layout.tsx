import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/lib/loading-context";
import GlobalLoader from "@/components/ui/GlobalLoader";

export const metadata: Metadata = {
  title: "AutaMedica - Telemedicina Avanzada",
  description:
    "Plataforma de telemedicina que conecta pacientes con profesionales de la salud a través de tecnología segura y conforme con HIPAA.",
  keywords: [
    "telemedicina",
    "medicina",
    "salud",
    "consultas online",
    "HIPAA",
    "AutaMedica",
  ],
  authors: [{ name: "E.M Medicina - UBA" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AutaMedica - Telemedicina Avanzada",
    description: "Plataforma de telemedicina HIPAA-compliant para consultas médicas seguras",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutaMedica - Telemedicina Avanzada",
    description: "Plataforma de telemedicina HIPAA-compliant para consultas médicas seguras",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <body className="antialiased">
        <LoadingProvider>
          {children}
          <GlobalLoader />
        </LoadingProvider>
      </body>
    </html>
  );
}
