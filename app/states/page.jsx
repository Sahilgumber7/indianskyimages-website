import Link from "next/link";
import { connectDB } from "../../lib/db";
import ImageModel from "../../models/Image";
import { getStateFromLocation } from "../../lib/images";

function slugifyState(name = "") {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default async function StatesIndexPage() {
  await connectDB();
  const rows = await ImageModel.aggregate([
    { $match: { moderation_status: { $in: ["approved", null] }, location_name: { $exists: true, $ne: null } } },
    { $group: { _id: "$location_name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 250 },
  ]);

  const stateMap = new Map();
  for (const row of rows) {
    const state = getStateFromLocation(row._id);
    if (!state) continue;
    stateMap.set(state, (stateMap.get(state) || 0) + row.count);
  }
  const states = [...stateMap.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <main className="isi-shell">
      <div className="isi-container max-w-4xl">
        <div className="isi-surface p-6 sm:p-8 mb-6">
          <p className="isi-label mb-2">Discover</p>
          <h1 className="text-4xl font-black tracking-tight mb-3">Browse By State</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
          SEO landing pages for each state archive.
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {states.map(([state, count]) => (
            <li key={state}>
              <Link
                href={`/states/${slugifyState(state)}`}
                className="isi-surface flex items-center justify-between px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white hover:scale-[1.01] transition-transform"
              >
                <span>{state}</span>
                <span className="isi-chip">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
