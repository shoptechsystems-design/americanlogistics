import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-6" style={{ background: "#090c10", color: "#f4f7fb" }}>
      <div className="text-center max-w-lg">
        <p style={{ color: "#ff9f1c", letterSpacing: ".2em", fontSize: 11, fontWeight: 800 }}>ROUTE NOT FOUND</p>
        <h1 style={{ fontSize: "clamp(80px, 22vw, 160px)", lineHeight: 1, fontWeight: 800, letterSpacing: "-.05em", margin: "12px 0" }}>404</h1>
        <p style={{ color: "#9aa6a7", lineHeight: 1.6, marginBottom: 32 }}>
          This page took a wrong turn. Let&apos;s get you back on the main road.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2"
          style={{ background: "#ff9f1c", color: "#151006", fontWeight: 800, padding: "14px 24px", fontSize: 13 }}
        >
          Back to American Logistics <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}
