export const mockExamFaqItemKeys = [
    "format",
    "parts",
    "tracks",
    "duration",
    "online",
    "microphone",
    "mobile",
    "pauseResume",
    "finalResult",
    "pdfVideos",
    "retake",
    "packDifference",
    "paymentMethods",
    "contactAfterPurchase",
] as const;

export type MockExamFaqItemKey = (typeof mockExamFaqItemKeys)[number];
