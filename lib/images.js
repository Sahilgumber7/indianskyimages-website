export function buildFastImageUrl(url, { width = 1600, quality = "auto:good" } = {}) {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_${quality},c_limit,w_${width}/`);
}

export function getStateFromLocation(locationName = "") {
  if (!locationName || typeof locationName !== "string") return "";
  const parts = locationName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return "";
  return parts[parts.length - 2];
}
