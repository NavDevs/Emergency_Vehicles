import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EV Priority System - ML Traffic Control",
  description: "Machine Learning enhanced emergency vehicle priority system with 17 road layouts. 60% faster response time using Random Forest algorithm.",
  keywords: ["EV Priority", "Traffic Control", "Machine Learning", "Emergency Vehicle", "Smart Traffic", "Random Forest"],
  authors: [{ name: "EV Priority Team" }],
  openGraph: {
    title: "EV Priority System - ML Traffic Control",
    description: "60% faster emergency response using ML across 17 road layouts",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0052FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}