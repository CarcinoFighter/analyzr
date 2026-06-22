import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carcino Analyzr — The Carcino Foundation",
  description: "Marketing analytics dashboard for The Carcino Foundation",
};

// Runs before paint so there's no light-mode flash for users who prefer dark.
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("carcino-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored ? stored === "dark" : prefersDark;
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-canvas">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <MobileNav />
              <main className="px-4 sm:px-8 lg:px-10 py-6 lg:py-10 max-w-[1200px] mx-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
