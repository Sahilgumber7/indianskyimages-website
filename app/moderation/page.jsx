"use client";

import { useEffect, useState } from "react";

export default function ModerationPage() {
  const [adminKey, setAdminKey] = useState("");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadQueue = async () => {
    if (!adminKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/moderation/pending", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load queue.");
      setQueue(data.data || []);
      window.localStorage.setItem("isi:admin-key", adminKey);
    } catch (err) {
      setError(err.message || "Failed to load queue.");
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id, action) => {
    const res = await fetch(`/api/moderation/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) return;
    setQueue((prev) => prev.filter((item) => String(item._id) !== String(id)));
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("isi:admin-key");
    if (saved) setAdminKey(saved);
  }, []);

  return (
    <main className="isi-shell">
      <div className="isi-container max-w-5xl space-y-6">
        <div className="isi-surface p-6 sm:p-8">
          <p className="isi-label mb-2">Admin</p>
          <h1 className="text-3xl font-black tracking-tight">Moderation Queue</h1>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin review key"
              className="h-11 flex-1 rounded-2xl border border-black/10 dark:border-white/10 px-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            />
            <button
              onClick={loadQueue}
              className="isi-btn isi-btn-primary h-11 px-5 rounded-2xl"
            >
              {loading ? "Loading..." : "Load Queue"}
            </button>
          </div>
          {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((item) => (
            <article key={String(item._id)} className="isi-surface p-3">
              <img
                src={item.image_url}
                alt={item.location_name || "Pending image"}
                className="w-full h-48 object-cover rounded-xl"
              />
              <p className="mt-2 text-sm font-bold">{item.location_name || "Unknown location"}</p>
              <p className="text-xs text-black/60 dark:text-white/60">
                {item.uploaded_by || "Anonymous"} | reports: {item.report_count || 0}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => moderate(item._id, "approve")}
                  className="isi-btn h-9 px-3 border-green-300 text-green-700 dark:text-green-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => moderate(item._id, "reject")}
                  className="isi-btn isi-btn-danger h-9 px-3"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
