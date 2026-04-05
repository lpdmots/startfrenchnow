import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@/app/styles/globals.css";
import Link from "next/link";

function DangerSign({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 220 190" className={className} aria-hidden="true">
            <path d="M97.9 11.4c5.2-8.8 18-8.8 23.2 0l85.1 143.3c5.3 8.9-1.1 20.3-11.5 20.3H23.3c-10.4 0-16.8-11.4-11.5-20.3L97.9 11.4Z" fill="#F8C531" stroke="#0B0B0B" strokeWidth="2.8" />
            <rect x="103.5" y="52" width="13" height="62" rx="6.5" fill="#0B0B0B" />
            <circle cx="110" cy="130" r="7.5" fill="#0B0B0B" />
        </svg>
    );
}

export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body className="font-sans">
                <main className="min-h-screen bg-[#F5F5F5] flex items-center">
                    <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-28 min-h-[640px] md:min-h-[760px]">
                        <div className="absolute top-0 left-0 pointer-events-none select-none">
                            <span className="block font-bold leading-none text-neutral-400/35 text-[42vw] md:text-[26vw] lg:text-[420px]">
                                404
                            </span>
                        </div>
                        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center md:items-end gap-10 md:gap-20 lg:gap-28 md:min-h-[520px]">
                            <div className="order-1 flex justify-center md:justify-center md:self-center">
                                <DangerSign className="w-[170px] sm:w-[220px] md:w-[330px] lg:w-[390px]" />
                            </div>
                            <div className="order-2 text-center md:text-left md:self-end md:justify-self-end md:max-w-[560px] md:pb-6">
                                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950">Oops!</h2>
                                <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">Page Not Found</h1>
                                <p className="mt-6 text-lg leading-relaxed text-neutral-700">The page you are looking for does not exist or has been moved. Check the URL or go back to homepage.</p>
                                <div className="mt-8 flex justify-center md:justify-start">
                                    <Link href="/" className="btn btn-primary full-width w-button w-full max-w-[360px] text-center">
                                        Go to homepage
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
