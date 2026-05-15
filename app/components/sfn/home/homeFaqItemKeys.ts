export const homeFaqItemKeys = ["choosePreparation", "realScenarios", "unknownLevel", "levels", "online", "timeline"] as const;

export type HomeFaqItemKey = (typeof homeFaqItemKeys)[number];
