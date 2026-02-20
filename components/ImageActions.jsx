"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function bookmarkKey(id) {
  return `isi:bookmark:${id}`;
}

export default function ImageActions({ imageId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLiked(window.localStorage.getItem(`isi:liked:${imageId}`) === "1");
    setBookmarked(window.localStorage.getItem(bookmarkKey(imageId)) === "1");
  }, [imageId]);

  const bookmarkLabel = useMemo(() => (bookmarked ? "Bookmarked" : "Bookmark"), [bookmarked]);

  const onLike = async () => {
    if (liked || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/images/${imageId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not like this image.");
      }
      setLikes(data.likes || likes + 1);
      setLiked(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`isi:liked:${imageId}`, "1");
      }
    } catch (err) {
      toast.error(err.message || "Could not like this image.");
    } finally {
      setSubmitting(false);
    }
  };

  const onReport = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/images/${imageId}/report`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not report this image.");
      }
      toast.success("Report submitted.");
    } catch (err) {
      toast.error(err.message || "Could not report this image.");
    } finally {
      setSubmitting(false);
    }
  };

  const onBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(bookmarkKey(imageId), next ? "1" : "0");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onLike}
        disabled={liked || submitting}
        className="isi-btn disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        aria-label="Like image"
      >
        {liked ? `Liked (${likes})` : `Like (${likes})`}
      </button>
      <button
        onClick={onBookmark}
        className="isi-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        aria-label="Bookmark image"
      >
        {bookmarkLabel}
      </button>
      <button
        onClick={onReport}
        disabled={submitting}
        className="isi-btn isi-btn-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label="Report image"
      >
        Report
      </button>
    </div>
  );
}
