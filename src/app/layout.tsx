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
    title: "Nooshe Jan",
    description:
        "The brutally honest dish-ranking app for the people who cook for you, so you find out about the shrimp dish before you make it again.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${lora.variable} ${inter.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-cream text-ink font-body sm:flex-row">
                {/* SiteHeader owns the whole shell (sidebar/header/bottom nav
                    all live inside it) since the layout differs by auth state —
                    see its own comment. sm:flex-row here is what lets its
                    Sidebar sit beside content instead of above it. */}
                <SiteHeader>{children}</SiteHeader>
            </body>
        </html>
    );
}
