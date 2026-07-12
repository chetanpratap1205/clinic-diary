"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "linear-gradient(135deg, #059669, #10b981)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 800,
        fontSize: 14,
        padding: "9px 22px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
        letterSpacing: "0.2px",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      🖨️ Print &nbsp;/&nbsp; छापें
    </button>
  );
}
