import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Display/headline face — warm humanist serif with personality (DESIGN.md
// §Type), but no quirky/distorted letterforms. Dish names, screen titles,
// and the score number itself use this.
const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
});

// Body/UI face — clean, legible sans for nav, buttons, forms, filter chips.
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noosh Jan",
  description: "Log the dishes you cook, rank them, and decide what to cook next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-body">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
