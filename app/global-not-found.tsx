import Link from "next/link";

export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body>
                <main className="min-h-screen flex items-center justify-center px-6 py-16">
                    <div className="max-w-xl text-center">
                        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">404</p>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">Page Not Found</h1>
                        <p className="mt-4 text-base text-neutral-600">
                            The page you are looking for does not exist.
                        </p>
                        <p className="mt-2 text-sm text-neutral-500">
                            La page demandee est introuvable.
                        </p>
                        <div className="mt-8">
                            <Link href="/" className="inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
                                Go Home
                            </Link>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
