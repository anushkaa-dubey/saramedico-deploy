import "./globals.css";

export const metadata = {
  title: "SaraMedico",
  description: "Healthcare Platform",
  icons: {
    icon: "/logo-icon.svg",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
