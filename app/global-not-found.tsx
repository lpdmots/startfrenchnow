import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@/app/styles/globals.css";
import Link from "next/link";

function DangerSign({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 220 190" className={className} aria-hidden="true">
            <path
                d="M97.9 11.4c5.2-8.8 18-8.8 23.2 0l85.1 143.3c5.3 8.9-1.1 20.3-11.5 20.3H23.3c-10.4 0-16.8-11.4-11.5-20.3L97.9 11.4Z"
                fill="#F8C531"
                stroke="#0B0B0B"
                strokeWidth="2.8"
            />
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
                    <div className="relative w-full max-w-[1200px] mx-auto px-6 py-14 md:py-20">
                        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                            <span className="font-bold leading-none text-neutral-400/35 text-[42vw] md:text-[30vw] lg:text-[370px]">
                                404
                            </span>
                        </div>
                        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center gap-8 md:gap-14">
                            <div className="order-1 flex justify-center md:justify-end">
                                <DangerSign className="w-[170px] sm:w-[220px] md:w-[320px] lg:w-[360px]" />
                            </div>
                            <div className="order-2 text-center md:text-left">
                                <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950">
                                    Oops!
                                </h2>
                                <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">
                                    Page Not Found
                                </h1>
                                <p className="mt-6 text-lg leading-relaxed text-neutral-700">
                                    The page you are looking for does not exist or has been moved. Check the URL or go
                                    back to homepage.
                                </p>
                                <div className="mt-8 flex justify-center md:justify-start">
                                    <Link
                                        href="/"
                                        className="w-full max-w-[360px] inline-flex items-center justify-center rounded-2xl bg-black px-8 py-4 text-2xl font-semibold text-white transition-opacity hover:opacity-90"
                                    >
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
