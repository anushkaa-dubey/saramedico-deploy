import logo from "@/public/logo2.svg";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-left">
        {children}
      </div>
      <div className="auth-right">
        <img src={logo.src} alt="SaraMedico" style={{ width: "220px", height: "auto" }} />
      </div>
    </div>
  );
}