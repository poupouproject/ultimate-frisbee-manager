import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; 
import { cn } from "@/lib/utils";
import { RefineProvider } from "@/components/refine-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ultimate Manager",
  description: "Gestion de club d'Ultimate Frisbee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <RefineProvider>{children}</RefineProvider>
      </body>
    </html>
  );
}