import Link from "next/link";
import { connectDB } from "../../../lib/db";
import ImageModel from "../../../models/Image";
import { buildFastImageUrl } from "../../../lib/images";

export default async function ContributorPage({ params }) {
  await connectDB();
  const { name } = await params;
  const contributorName = decodeURIComponent(name);

  const [images, totals] = await Promise.all([
    ImageModel.find(
      { uploaded_by: contributorName, moderation_status: { $in: ["approved", null] } },
      "image_url location_name uploaded_at"
    )
      .sort({ uploaded_at: -1 })
      .limit(80)
      .lean(),
    ImageModel.aggregate([
      {
        $match: {
          uploaded_by: contributorName,
          moderation_status: { $in: ["approved", null] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          month: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$uploaded_at",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const stats = totals[0] || { total: images.length, month: 0 };

  return (
    <main className="isi-shell">
      <div className="isi-container">
        <header className="isi-surface p-6 sm:p-8 mb-8 space-y-3">
          <p className="isi-label">Contributor</p>
          <h1 className="text-4xl font-black tracking-tight">{contributorName}</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {stats.total} total uploads, {stats.month} in last 30 days.
          </p>
          <Link href="/gallery" className="isi-btn">
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
