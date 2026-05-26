import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Conquista — Archivo de Investigación",
  description:
    "Archivo de investigación auditable sobre la conquista española del Tahuantinsuyu (1527–1572).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex bg-ink-50">
        <Sidebar />
        <main className="flex-1 min-w-0 border-l border-ink-200">
          {children}
        </main>
      </body>
    </html>
  );
}
