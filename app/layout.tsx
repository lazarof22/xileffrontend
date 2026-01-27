import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MuiProvider from "@/theme/MuiProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Gestión",
  description: "Plataforma administrativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MuiProvider>
          {children}
        </MuiProvider>
      </body>
    </html>
  );
}
