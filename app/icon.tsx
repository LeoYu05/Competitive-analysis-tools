import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, rgba(103,232,249,0.35), transparent 55%), linear-gradient(135deg, #020817, #111827)",
          color: "#ecfeff",
          fontSize: 28,
          fontWeight: 700,
          borderRadius: 16,
          border: "1px solid rgba(103,232,249,0.18)"
        }}
      >
        CQ
      </div>
    ),
    size
  );
}
