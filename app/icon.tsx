import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Q
      </div>
    ),
    {
      ...size,
    }
  );
}
