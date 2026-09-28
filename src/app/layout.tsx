import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Tap",
  description: "Know your month in one look.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "One Tap",
    statusBarStyle: "black-translucent",
  },
  // The favicon comes from the src/app/icon.png file convention, which takes
  // precedence over metadata. Only the Apple touch icon needs declaring.
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#021711",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
