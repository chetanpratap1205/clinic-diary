import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const clinicName = searchParams.get("name") || "Doctor Diary";
  const doctorName = searchParams.get("doctor") || "";
  const specialty = searchParams.get("specialty") || "";
  const fee = searchParams.get("fee") || "";

  const isClinic = !!doctorName;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column" as const,
          backgroundColor: "#f8fafc",
          fontFamily: "sans-serif",
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        {/* Background gradient blob top-left */}
        <div
          style={{
            position: "absolute" as const,
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Background gradient blob bottom-right */}
        <div
          style={{
            position: "absolute" as const,
            bottom: -60,
            right: -60,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            height: 6,
            background: "linear-gradient(90deg, #0f766e 0%, #6366f1 100%)",
            width: "100%",
            flexShrink: 0,
          }}
        />

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column" as const,
            padding: "52px 64px",
            justifyContent: "space-between",
          }}
        >
          {/* Top: Logo + Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(15,118,110,0.3)",
              }}
            >
              {/* Activity icon as SVG */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              Doctor Diary
            </span>
            <span style={{ fontSize: 16, color: "#94a3b8", fontWeight: 500 }}>
              by NatureXpress
            </span>
          </div>

          {/* Middle: Main content */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
            {isClinic ? (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
                {/* Clinic avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 20,
                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 36,
                      fontWeight: 800,
                      color: "white",
                      boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
                    }}
                  >
                    {clinicName[0]?.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1.1 }}>
                      {clinicName}
                    </span>
                    <span style={{ fontSize: 22, color: "#475569", fontWeight: 500 }}>
                      Dr. {doctorName}
                    </span>
                    {specialty && (
                      <span style={{ fontSize: 18, color: "#94a3b8" }}>{specialty}</span>
                    )}
                  </div>
                </div>
                {/* Pills */}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <div style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: 100,
                    padding: "8px 20px",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#15803d",
                  }}>
                    ✓ No signup needed
                  </div>
                  <div style={{
                    background: "#eff6ff",
                    border: "1.5px solid #bfdbfe",
                    borderRadius: 100,
                    padding: "8px 20px",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1d4ed8",
                  }}>
                    ⚡ Book in 30 seconds
                  </div>
                  {fee && (
                    <div style={{
                      background: "#fefce8",
                      border: "1.5px solid #fde68a",
                      borderRadius: 100,
                      padding: "8px 20px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#92400e",
                    }}>
                      ₹{fee} fee
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
                <div style={{ fontSize: 60, fontWeight: 800, color: "#0f172a", letterSpacing: "-2px", lineHeight: 1.1 }}>
                  Modern appointments for
                </div>
                <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, color: "#0f766e" }}>
                  elite practices
                </div>
                <div style={{ fontSize: 22, color: "#64748b", fontWeight: 400, marginTop: 8 }}>
                  Fast, premium booking — patients book in under 30 seconds.
                </div>
              </div>
            )}
          </div>

          {/* Bottom: domain + CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 18, color: "#64748b" }}>
              doctor.naturexpress.in
            </span>
            <div style={{
              background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
              borderRadius: 100,
              padding: "12px 28px",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 4px 16px rgba(15,118,110,0.3)",
            }}>
              {isClinic ? "Book Appointment →" : "Get Started Free →"}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
