import Link from "next/link";
import { connectDB } from "../../../lib/db";
import ImageModel from "../../../models/Image";
import { buildFastImageUrl } from "../../../lib/images";

function toStateName(slug) {
  return decodeURIComponent(slug)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { state } = await params;
  const stateName = toStateName(state);
  return {
    title: `${stateName} Sky Images | Indian Sky Images`,
    description: `Explore community-uploaded sky photos captured in ${stateName}.`,
  };
}

export default async function StatePage({ params }) {
  await connectDB();
  const { state } = await params;
  const stateName = toStateName(state);

  const images = await ImageModel.find(
    {
      moderation_status: { $in: ["approved", null] },
      location_name: { $regex: `(?:^|,\\s*)${stateName}(?:\\s*,|$)`, $options: "i" },
    },
    "image_url location_name uploaded_by"
  )
    .sort({ uploaded_at: -1 })
    .limit(120)
    .lean();

  return (
    <main className="isi-shell">
      <div className="isi-container">
        <header className="isi-surface p-6 sm:p-8 mb-8">
          <p className="isi-label mb-2">State Archive</p>
          <h1 className="text-4xl font-black tracking-tight">{stateName} Sky Archive</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-2">{images.length} images available.</p>
          <Link href="/gallery" className="isi-btn mt-4">
            Back to gallery
          </Link>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Link
              key={String(img._id)}
              href={`/image/${img._id}`}
              className="block rounded-[1.25rem] sm:rounded-[1.75rem] overflow-hidden border border-black/5 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              <img
                src={buildFastImageUrl(img.image_url, { width: 700 })}
                alt={img.location_name || "Sky image"}
                className="w-full h-44 object-cover"
                loading="lazy"
                decoding="async"
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
