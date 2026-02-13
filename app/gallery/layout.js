export const metadata = {
  title: "Gallery",
  description:
    "Browse the Indian Sky Images gallery to explore community-captured sky photography from locations across India.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Indian Sky Images Gallery",
    description:
      "Explore a visual gallery of sky photographs submitted by the Indian Sky Images community.",
    url: "/gallery",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Sky Images Gallery",
    description:
      "Explore a visual gallery of sky photographs submitted by the Indian Sky Images community.",
  },
};

export default function GalleryLayout({ children }) {
  return children;
}
