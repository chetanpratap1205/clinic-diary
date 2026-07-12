"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "linear-gradient(135deg, #059669, #10b981)",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 800,
        fontSize: "14px",
        padding: "10px 22px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
        letterSpacing: "0.3px",
        transition: "all 0.2s",
      }}
    >
      🖨️ Print PDF &nbsp;/&nbsp; छापें
    </button>
  );
}
