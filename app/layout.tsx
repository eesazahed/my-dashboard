import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardProvider } from "@/context/DashboardContext";
import { PageTitle } from "@/components/layout/PageTitle";
import "./globals.css";

const GeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const GeistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My dashboard",
  description: "A personal single-user dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full bg-[#191919] antialiased`}
    >
      <body className="min-h-full font-sans text-zinc-100">
        <DashboardProvider>
          <PageTitle />
          {children}
        </DashboardProvider>
      </body>
    </html>
  );
}
