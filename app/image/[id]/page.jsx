import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "../../../lib/db";
import ImageModel from "../../../models/Image";
import { buildFastImageUrl, getStateFromLocation } from "../../../lib/images";
import ImageActions from "../../../components/ImageActions";
import DetailNavbar from "../../../components/DetailNavbar";
import SiteFooter from "../../../components/SiteFooter";

export async function generateMetadata({ params }) {
  await connectDB();
  const { id } = await params;
  const item = await ImageModel.findById(id, "location_name uploaded_by image_url moderation_status").lean();
  if (!item || (item.moderation_status && item.moderation_status !== "approved")) {
    return { title: "Image Not Found | Indian Sky Images" };
  }

  const title = item.location_name ? `${item.location_name} | Indian Sky Images` : "Sky Image | Indian Sky Images";
  const description = `Captured by ${item.uploaded_by || "Anonymous"} for the Indian Sky Images archive.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: buildFastImageUrl(item.image_url, { width: 1600 }) }],
    },
  };
}

export default async function ImageDetailPage({ params }) {
  await connectDB();
  const { id } = await params;
  const image = await ImageModel.findById(id).lean();
  if (!image || (image.moderation_status && image.moderation_status !== "approved")) {
    notFound();
  }

  const stateName = getStateFromLocation(image.location_name);
  const displayLocation = image.location_name || "Unknown Location";
  const displayContributor = image.uploaded_by || "Anonymous";
  const escapedState = stateName ? stateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;
  const similarQuery = escapedState
    ? {
        _id: { $ne: image._id },
        moderation_status: { $in: ["approved", null] },
        location_name: { $regex: `(?:^|,\\s*)${escapedState}(?:\\s*,|$)`, $options: "i" },
      }
    : {
        _id: { $ne: image._id },
        moderation_status: { $in: ["approved", null] },
        uploaded_by: image.uploaded_by,
      };

  const similarImages = await ImageModel.find(
    similarQuery,
    "image_url location_name uploaded_by uploaded_at"
  )
    .sort({ uploaded_at: -1 })
    .limit(6)
    .lean();

  return (
    <main className="min-h-screen bg-white text-black">
      <DetailNavbar />
      <article className="isi-container grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-black/10 bg-white relative overflow-hidden p-2 sm:p-3">
          <div className="w-full h-[min(72dvh,44rem)] sm:h-[min(68dvh,42rem)] flex items-center justify-center rounded-[1.2rem] sm:rounded-[1.6rem] bg-black/[0.03]">
            <img
              src={buildFastImageUrl(image.image_url, { width: 1800 })}
              alt={image.location_name ? `Sky image from ${image.location_name}` : "Sky image"}
              className="max-h-full max-w-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <section className="rounded-[1.5rem] sm:rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8 space-y-5">
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-black/50">Image Detail</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
            {displayLocation}
          </h1>
          <div className="flex flex-wrap gap-2">
            <ImageActions imageId={String(image._id)} initialLikes={image.likes || 0} />
          </div>
          <p className="text-sm text-black/70">
            By{" "}
            <Link
              href={`/contributor/${encodeURIComponent(displayContributor)}`}
              className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              {displayContributor}
            </Link>
          </p>
          <p className="text-sm text-black/70">
            Uploaded {new Date(image.uploaded_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          {stateName && (
            <p className="text-sm text-black/70">
              State:{" "}
              <Link
                href={`/states/${encodeURIComponent(stateName.toLowerCase().replace(/\s+/g, "-"))}`}
                className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                {stateName}
              </Link>
            </p>
          )}
          <Link
            href="/gallery"
            className="isi-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            Back To Gallery
          </Link>
        </section>
      </article>

      {similarImages.length > 0 && (
        <section className="isi-container pt-0">
          <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-black/10 bg-white p-5 sm:p-6">
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Similar Images</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {similarImages.map((item) => (
                <Link
                  key={String(item._id)}
                  href={`/image/${item._id}`}
                  className="block rounded-2xl overflow-hidden border border-black/5 bg-gray-50 hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={buildFastImageUrl(item.image_url, { width: 520 })}
                    alt={item.location_name || "Similar sky image"}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
