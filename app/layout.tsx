import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قَدْهَا؟ (QADHA) | منصة تحديات الگلسة والسهرة التفاعلية",
  description:
    "اللعبة الجماعية العربية والمغربية الأولى التي تجمع بين لوحة قَدْهَا؟ التفاعلية و ٨ تحديات سريعة بالتيليفون مع الحكم العربي الذكي.",
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
