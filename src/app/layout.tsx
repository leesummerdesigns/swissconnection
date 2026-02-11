import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "The Swiss Connection — Private Services from People Near You",
    template: "%s | The Swiss Connection",
  },
  description:
    "Find skilled individuals offering private services in Switzerland. Haircuts, cleaning, repairs, tutoring, and more — no businesses, just real people with real talent.",
  keywords: [
    "services Switzerland",
    "private services",
    "haircuts Switzerland",
    "house cleaning",
    "home repairs",
    "tutoring",
    "service marketplace",
    "Swiss services",
  ],
  authors: [{ name: "The Swiss Connection" }],
  metadataBase: new URL("https://swissconnection.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_CH",
    siteName: "The Swiss Connection",
    title: "The Swiss Connection — Private Services from People Near You",
    description:
      "Find skilled individuals offering private services in Switzerland. No businesses — just real people with real talent.",
    images: [{ url: "/hero_image2.jpg", width: 1200, height: 630, alt: "The Swiss Connection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Swiss Connection — Private Services from People Near You",
    description:
      "Find skilled individuals offering private services in Switzerland.",
    images: ["/hero_image2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
