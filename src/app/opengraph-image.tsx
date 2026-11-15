import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: discover and plan travel across India`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The default preview image when a page is shared on social media or in chat apps. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#ffffff",
          background: "radial-gradient(circle at 80% 20%, #1c5865 0%, #0b2a33 55%, #081a20 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
          <span style={{ color: "#e6c61a" }}>Tour</span>
          <span style={{ marginLeft: 14 }}>India</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 940 }}>Explore India state by state, and plan the trip that fits you</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#c9d2d2" }}>Guides to all 36 states and Union Territories · Trip planner · Festival calendar</div>
        </div>
        <div style={{ display: "flex", height: 8, width: 360, background: "linear-gradient(90deg, #a8186f, #f2a33c, #75c6d4)", borderRadius: 4 }} />
      </div>
    ),
    size,
  );
}
