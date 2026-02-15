import type { Metadata } from "next";
import { Inter, Funnel_Display } from "next/font/google";
import "./globals.css";
import { DeveloperSignature } from "@/components/developer-signature";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leadestate Voice",
  description: "AI voice assistant for real estate lead qualification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${funnelDisplay.variable} ${inter.className} antialiased font-sans min-h-dvh bg-gray-100 flex flex-col`}
      >
        <div className="flex-1 min-h-0">{children}</div>
        <DeveloperSignature />
      </body>
    </html>
  );
}
