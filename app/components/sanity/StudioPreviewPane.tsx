"use client";

import { useMemo, useState } from "react";

const fallbackBaseUrl = "http://localhost:3000";

export default function StudioPreviewPane() {
    const [reloadKey, setReloadKey] = useState(0);

    const previewUrl = useMemo(() => {
        const baseUrl =
            process.env.NEXT_PUBLIC_PRODUCTION_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL ||
            fallbackBaseUrl;

        const normalizedBaseUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
        return `${normalizedBaseUrl}/api/preview`;
    }, []);

    return (
        <div className="h-full w-full bg-white">
            <div className="flex items-center justify-end border-b p-2">
                <button
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                    onClick={() => setReloadKey((value) => value + 1)}
                    type="button"
                >
                    Reload preview
                </button>
            </div>
            <iframe
                key={reloadKey}
                className="h-[calc(100%-52px)] w-full border-0"
                src={previewUrl}
                title="Preview"
            />
        </div>
    );
}
