import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiabetesCare Admin",
  description: "Painel administrativo do app DiabetesCare",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
