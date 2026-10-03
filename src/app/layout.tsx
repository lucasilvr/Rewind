import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

interface LayoutProps<T extends string> {
  children: React.ReactNode;
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
  pathname: T;
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Rewind",
  description: "Trabalho de Gerência de Projeto de Software",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}