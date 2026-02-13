import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_URL } from "../lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Indian Sky Images | Explore & Share the Beauty of the Indian Horizon",
    template: "%s | Indian Sky Images",
  },
  description:
    "A collective digital archive of the Indian sky. Upload and explore stunning sunset, sunrise, and celestial images captured across India. Join our community of sky observers.",
  keywords: [
    "indian sky",
    "sky images",
    "sunset india",
    "sunrise india",
    "weather photos",
    "cloud photography",
    "indian horizon",
    "celestial archive",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Indian Sky Images Community" }],
  category: "photography",
  openGraph: {
    title: "Indian Sky Images | Explore & Share the Beauty of the Indian Horizon",
    description:
      "Explore a live 3D globe of sky captures from across India and discover community-uploaded sky photography.",
    url: "/",
    siteName: "Indian Sky Images",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Indian Sky Images",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Sky Images | Explore & Share the Beauty of the Indian Horizon",
    description: "Witness the beauty of the Indian sky through a collective lens.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

import { ThemeProvider } from "../components/theme-provider";
import GlobalEffects from "../components/GlobalEffects";

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Indian Sky Images",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    sameAs: ["https://x.com/indianskyimages", "https://t.co/DenLkvA9pO"],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Indian Sky Images",
    url: SITE_URL,
    inLanguage: "en-IN",
    description:
      "A collective digital archive of the Indian sky featuring community-submitted sky photography.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalEffects />
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
