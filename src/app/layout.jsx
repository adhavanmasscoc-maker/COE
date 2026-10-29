import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Aknex COE — Examination Portal",
  description:
    "Aknex Controller of Examinations — Secure academic examination system for Tamil Nadu Samacheer Kalvi. Class 10 & 12 preparation portal.",
  keywords: "COE, examinations, Samacheer Kalvi, Tamil Nadu, Class 10, Class 12",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AppShell>{children}</AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
