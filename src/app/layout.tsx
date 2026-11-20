import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Kabuk from "@/components/Kabuk";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Müşteri ve Evrak Takip · Novarge",
  description: "Mali müşavirlik bürosu için müşteri, evrak ve beyanname takibi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen">
        <Kabuk>{children}</Kabuk>
      </body>
    </html>
  );
}
