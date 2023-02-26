"use client";
import { GoogleAnalytics as GoogAnalitics } from "nextjs-google-analytics";

function GoogleAnalytics() {
    return <GoogAnalitics trackPageViews />;
}

export default GoogleAnalytics;
