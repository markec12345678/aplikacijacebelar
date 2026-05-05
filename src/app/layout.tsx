import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Čebelarski Pomočnik - AI-powered Beekeeping Assistant",
  description: "Sodobna aplikacija za upravljanje čebeljaka z AI analizo slik, tehtnicami in sledenjem bolezni.",
  keywords: ["Čebelarstvo", "Čebelarski pomočnik", "AI analiza", "tehtnice", "bolezni čebel", "Next.js", "TypeScript"],
  authors: [{ name: "Čebelarski Pomočnik Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Čebelarski Pomočnik",
    description: "AI-powered hive management for modern beekeepers",
    url: "https://chat.z.ai",
    siteName: "Čebelarski Pomočnik",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Čebelarski Pomočnik",
    description: "AI-powered hive management with image analysis and scale integration",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
