export default function OnboardingLayout({ children }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-inter)"
        }}>
            {children}
        </div>
    );
}
