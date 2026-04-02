export const REVIEW_STATUS_VALUES = ["requested", "scheduled", "completed", "cancelled"] as const;

export type ReviewStatusValue = (typeof REVIEW_STATUS_VALUES)[number];

export const REVIEW_STATUS_LABELS: Record<ReviewStatusValue, string> = {
    requested: "Demandé",
    scheduled: "Planifié",
    completed: "Terminé",
    cancelled: "Annulé",
};

export const REVIEW_STATUS_BADGE_CLASSES: Record<ReviewStatusValue, string> = {
    requested: "bg-secondary-6 text-neutral-800",
    scheduled: "bg-secondary-5 text-neutral-800",
    completed: "bg-secondary-2 text-neutral-100",
    cancelled: "bg-neutral-400 text-neutral-800",
};

export const getReviewStatusLabel = (status?: string) => {
    const key = (status || "") as ReviewStatusValue;
    return REVIEW_STATUS_LABELS[key] || status || "-";
};

export const getReviewStatusBadgeClass = (status?: string) => {
    const key = (status || "") as ReviewStatusValue;
    return REVIEW_STATUS_BADGE_CLASSES[key] || "bg-neutral-300 text-neutral-800";
};

export const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("fr-CH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatScore = (score?: { score?: number; max?: number; percentage?: number } | null) => {
    if (!score) return "-";
    const points = Number(score.score);
    const max = Number(score.max);
    if (Number.isFinite(points) && Number.isFinite(max) && max > 0) {
        const percentage = Math.round((points / max) * 100);
        return `${points}/${max} (${percentage}%)`;
    }

    const ratio = Number(score.percentage);
    if (Number.isFinite(ratio)) {
        return `${Math.round(ratio)}%`;
    }

    return "-";
};

export const formatAnswerScore = (score?: { score?: number; max?: number } | number | null) => {
    if (typeof score === "number") {
        if (!Number.isFinite(score)) return "-";
        return `${score}`;
    }
    if (!score) return "-";
    const points = Number(score.score);
    const max = Number(score.max);
    if (!Number.isFinite(points) && !Number.isFinite(max)) return "-";
    if (!Number.isFinite(max) || max <= 0) return Number.isFinite(points) ? `${points}` : "-";
    if (!Number.isFinite(points)) return `0/${max}`;
    return `${points}/${max}`;
};

export const toPortableTextPlain = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (!Array.isArray(value)) return "";

    return value
        .map((block) => {
            if (!block || typeof block !== "object") return "";
            const maybeText = (block as { text?: unknown }).text;
            if (typeof maybeText === "string") return maybeText.trim();

            const children = (block as { children?: unknown }).children;
            if (!Array.isArray(children)) return "";
            return children
                .map((child) => {
                    if (!child || typeof child !== "object") return "";
                    const text = (child as { text?: unknown }).text;
                    return typeof text === "string" ? text : "";
                })
                .join("")
                .trim();
        })
        .filter(Boolean)
        .join("\n")
        .trim();
};

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;

    return `${normalizedDomain}${normalizedResource}`;
};
