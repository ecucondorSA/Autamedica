import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AutaMedica Auth Hub - Acceso Seguro",
  description: "Centro de autenticación segura para el ecosistema AutaMedica",
  keywords: "AutaMedica, auth, autenticación, médicos, pacientes, empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{backgroundColor: '#0f0f10'}}
      >
        {children}
      </body>
    </html>
  );
}