import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUBZ | Sunburn Campus DJ",
  description:
    "Rubz is a NextGEN DJ and Sunburn Campus DJ with 1,000+ shows across India, Malaysia, Thailand and Indonesia. Book him for your college fest.",
  openGraph: {
    title: "RUBZ | Sunburn Campus DJ",
    description: "1,000+ shows. College fests across India plus Malaysia, Thailand and Indonesia.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a0712", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {/* Plain <link> rather than next/font: the 3D scene draws text to canvas by family name ('Unbounded'),
            and next/font hashes family names. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
