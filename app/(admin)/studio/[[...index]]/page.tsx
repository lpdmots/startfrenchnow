"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Learn French at Your Own Pace with Expert-led Video Lessons",
    description:
        "Improve your French language skills with our comprehensive video lessons. We propose a convenient, serious and fun way to learn French as a foreign language and achieve fluency. Start french now!",
};

export default function StudioPage() {
    //  Supports the same props as `import {Studio} from 'sanity'`, `config` is required
    return <NextStudio config={config} />;
}
