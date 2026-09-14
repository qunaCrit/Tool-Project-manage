import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider, LanguageToggle } from "@/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tool Project Manage",
  description: "Local Project Management Assistant",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <LanguageProvider>
          <LanguageToggle />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
