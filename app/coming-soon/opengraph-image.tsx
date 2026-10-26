import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Solsjin UI, Solana components that work. Launching soon.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const thunder = await readFile(join(process.cwd(), "public/fonts/thunder-bold-lc.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#ffffff", position: "relative" }}>
        <div style={{ position: "absolute", left: -120, top: -80, width: 640, height: 420, borderRadius: 9999, background: "radial-gradient(closest-side, rgba(153,69,255,.18), rgba(255,255,255,0))" }} />
        <div style={{ position: "absolute", right: -120, top: 60, width: 600, height: 420, borderRadius: 9999, background: "radial-gradient(closest-side, rgba(20,241,149,.16), rgba(255,255,255,0))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 9999, border: "1px solid #e8e8e4", fontSize: 24, color: "#3a3a38", background: "rgba(255,255,255,.7)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 9999, background: "#0a9c72" }} />
          Launching soon
        </div>
        <div style={{ marginTop: 30, fontFamily: "Thunder", fontSize: 230, lineHeight: 0.82, color: "#000" }}>SOLSJIN-UI</div>
        <div style={{ marginTop: 34, fontSize: 32, color: "#4a4a47", letterSpacing: "-0.02em" }}>Solana components that actually work · solsjin.com</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Thunder", data: thunder, weight: 700, style: "normal" }] },
  );
}
