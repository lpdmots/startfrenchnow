const CLIENT_MESSAGE_PATHS = [
    "Navigation",
    "NotificationsMenu",
    "ExercisesPage",
    "HomeRitaVideo",
    "CommentsCarousel",
    "BlogHelpCta",
    "BlogContactCta",
    "OfficialFideSourceNotice",
    "Fide.CourseRatings",
    "Fide.CommentComposer",
    "Fide.CommentThread",
    "Fide.ExamsSection",
    "Fide.FideExams",
    "Fide.FidePack.CoursesAccordionClient",
    "Fide.FideVideosPage",
    "Fide.HowClassLook",
    "Fide.InfosVideos",
    "Fide.PackFidePage",
    "Fide.PackFidePricing",
    "Fide.PreviewsSection",
    "Fide.PriceSliderFide",
    "Fide.PrivateCoursesPricing.customHours",
    "Fide.ReviewsFide",
    "Fide.VideosSection",
    "Fide.dashboard.Exams.ExamsSuggestions",
    "Fide.dashboard.PrivateLessons",
];

function getPath(source, parts) {
    let value = source;
    for (const part of parts) {
        if (!value || typeof value !== "object" || !(part in value)) return undefined;
        value = value[part];
    }
    return value;
}

function setPath(target, parts, value) {
    let cursor = target;
    parts.forEach((part, index) => {
        if (index === parts.length - 1) {
            cursor[part] = value;
            return;
        }
        cursor[part] ||= {};
        cursor = cursor[part];
    });
}

export function pickClientMessages(messages) {
    const selected = {};

    for (const messagePath of CLIENT_MESSAGE_PATHS) {
        const parts = messagePath.split(".");
        const value = getPath(messages, parts);
        if (value !== undefined) setPath(selected, parts, value);
    }

    return selected;
}
