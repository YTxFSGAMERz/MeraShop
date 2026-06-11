import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { CompareDrawer } from "@/components/shop/CompareDrawer";
import { AIAssistant } from "@/components/shop/AIAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#d97706",
};

export const metadata: Metadata = {
  title: {
    default: "MeraShop — India's Favourite Online Marketplace",
    template: "%s | MeraShop",
  },
  description:
    "Shop the best deals on electronics, fashion, home & kitchen, beauty and more. Fast delivery, easy returns, and secure UPI payments. Dil Se Indian, Deal Se Smart!",
  keywords: [
    "online shopping",
    "India",
    "electronics",
    "fashion",
    "deals",
    "UPI",
    "MeraShop",
    "buy online",
    "discount",
    "fast delivery",
  ],
  authors: [{ name: "MeraShop" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MeraShop — India's Favourite Online Marketplace",
    description:
      "Shop the best deals on electronics, fashion, home & kitchen, beauty and more. Fast delivery, easy returns, and secure UPI payments.",
    url: "https://merashop.in",
    siteName: "MeraShop",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeraShop — India's Favourite Online Marketplace",
    description:
      "Shop the best deals on electronics, fashion, home & kitchen, beauty and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MeraShop",
    url: "https://merashop.in",
    logo: "https://merashop.in/logo.svg",
    description:
      "India's favourite online marketplace — fresh deals every day on fashion, electronics, home & more.",
    slogan: "Dil Se Indian, Deal Se Smart",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-1800-123-4567",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://facebook.com/merashop",
      "https://instagram.com/merashop",
      "https://twitter.com/merashop",
      "https://youtube.com/merashop",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MeraShop",
    url: "https://merashop.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://merashop.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <MobileBottomNav />
          <CompareDrawer />
          <ScrollToTop />
          <AIAssistant />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
