import Link from "next/link";

export default function LocaleNotFound() {
    return (
        <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
            <div className="max-w-xl text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">404</p>
                <h1 className="mt-3 text-3xl sm:text-4xl font-bold">Page introuvable</h1>
                <p className="mt-4 text-base text-neutral-600">
                    Cette page n&apos;existe pas ou a ete deplacee.
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                    This page does not exist anymore.
                </p>
                <div className="mt-8">
                    <Link href="/" className="inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
                        Retour a l&apos;accueil
                    </Link>
                </div>
            </div>
        </main>
    );
}
