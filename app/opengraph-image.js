import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "white",
          background:
            "linear-gradient(135deg, rgb(7, 10, 20) 0%, rgb(22, 43, 77) 40%, rgb(255, 142, 90) 100%)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Indian Sky Images
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            <span>Explore And Share</span>
            <span>India&apos;s Sky</span>
          </div>
          <div style={{ fontSize: 30, opacity: 0.9 }}>
            Community archive of sunrise, sunset, and celestial photography
          </div>
        </div>
      </div>
    ),
    size
  );
}
