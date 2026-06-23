import { ImageResponse } from "next/og";

export const alt = "Website Prompt Generator — Blog";
export const size = { width: 1200, height: 630 };
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
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, color: "#a3a3a3" }}>
          <span style={{ marginRight: 14, color: "#ffffff" }}>✦</span>
          Website Prompt Generator
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Blog
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#737373" }}>
          Guides, updates, and tips
        </div>
      </div>
    ),
    { ...size }
  );
}
