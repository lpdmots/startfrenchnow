import { CATEGORIESCOLORS } from "@/app/lib/constantes";
import { Category } from "@/app/types/sfn/blog";
import React from "react";

export const CategoryBadge = ({ category, label, primary = false }: { category: Category; label: string; primary?: boolean }) => {
    const badgeColors = CATEGORIESCOLORS[category as keyof typeof CATEGORIESCOLORS];
    const classes = primary ? "blog-card-badge-wrapper-top text-right" : "";

    if (!label) return null;

    return (
        <div className={classes}>
            <div className="badge-primary small" style={{ backgroundColor: badgeColors }}>
                {label}
            </div>
        </div>
    );
};
