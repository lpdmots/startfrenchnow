"use client";
import React from "react";
import { LazyMotion, domAnimation } from "framer-motion";

const loadFeatures = () => import("./features").then((res) => res.default);

function LazyM({ children }: { children: React.ReactNode }) {
    return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}

export default LazyM;
