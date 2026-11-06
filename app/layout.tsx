import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سين جيم × قمنم | منصة ألعاب السهرة الجماعية التفاعلية",
  description:
    "اللعبة الجماعية العربية الأولى التي تجمع بين لوحة سين جيم المطورة و ٨ ألعاب سهرة تفاعلية بالجوال مع الحكم العربي الذكي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Readex+Pro:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo antialiased bg-cream text-black min-h-screen selection:bg-sunny selection:text-black">
        {children}
      </body>
    </html>
  );
}
