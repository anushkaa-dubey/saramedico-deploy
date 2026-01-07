export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-left">
        {children}
      </div>

      <div className="auth-right">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo Placeholder */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#1f2937",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
            }}
          >
            S
          </div>

          {/* Brand Text */}
          <div style={{ fontSize: "20px", fontWeight: "600" }}>
            <span style={{ color: "#ffffff" }}>Sara</span>
            <span style={{ color: "#4cc9f0" }}>Medico</span>
          </div>
        </div>
      </div>
    </div>
  );
}
