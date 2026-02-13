import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Indian Sky Images | Explore & Share the Beauty of the Indian Horizon",
  description: "A collective digital archive of the Indian sky. Upload and explore stunning sunset, sunrise, and celestial images captured across India. Join our community of sky observers.",
  keywords: ["indian sky", "sky images", "sunset india", "sunrise india", "weather photos", "cloud photography", "indian horizon", "celestial archive"],
  authors: [{ name: "Indian Sky Images Community" }],
  openGraph: {
    title: "Indian Sky Images | The Collective Horizon",
    description: "Explore a live 3D globe of sky captures from across the Indian subcontinent.",
    url: "https://indianskyimages.com",
    siteName: "Indian Sky Images",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Sky Images | The Collective Horizon",
    description: "Witness the beauty of the Indian sky through a collective lens.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { ThemeProvider } from "../components/theme-provider";
import GlobalEffects from "../components/GlobalEffects";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
