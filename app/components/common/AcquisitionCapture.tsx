"use client";

import { useEffect } from "react";
import { captureAcquisitionSource } from "@/app/lib/acquisition.client";

export default function AcquisitionCapture() {
    useEffect(() => {
        captureAcquisitionSource();
    }, []);

    return null;
}
