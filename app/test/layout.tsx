import "@/app/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Test Speech to Speech",
    robots: {
        index: false,
        follow: false,
    },
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body className="min-h-screen bg-neutral-100 text-neutral-800 antialiased">{children}</body>
        </html>
    );
}
