import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function MockExamLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
