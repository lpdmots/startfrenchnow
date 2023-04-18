/* Fade in du parent puis des enfants chacun leur tour. Comme my cores values*/
export const fadeInOneByOneParent = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.3,
            duration: 0.5,
            delayChildren: 1,
            staggerChildren: 0.1,
        },
    },
};

export const fadeInOneByOneItem = {
    hidden: { y: 50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};
