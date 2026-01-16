import logo from "@/public/logo.png";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-left">
        {children}
      </div>

      <div className="auth-right">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Main Logo */}
          <img src={logo.src} alt="SaraMedico" style={{ width: "220px", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}
