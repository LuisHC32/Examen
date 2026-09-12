import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VentasFix — Backoffice",
  description: "Administración de usuarios, productos y clientes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--vf-paper)] text-[var(--vf-ink)]">
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{ duration: 3500 }}
        />
      </body>
    </html>
  );
}
