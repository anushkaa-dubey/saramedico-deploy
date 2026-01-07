import "./globals.css";

export const metadata = {
  title: "SaraMedico",
  description: "Healthcare Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
