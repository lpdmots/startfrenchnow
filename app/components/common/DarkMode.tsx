"use client";
import { useState, useEffect } from "react";
import { themeChange } from "theme-change";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

function DarkMode() {
    const [toggle, setToggle] = useState<string>("");
    const t = useTranslations("Navigation");
    useEffect(() => {
        themeChange(false);
        // 👆 false parameter is required for react project
    }, []);

    const handleClick = (theme: "light" | "dark") => {
        setToggle(theme);
        localStorage.setItem("sfn-theme", theme);
        document.cookie = `sfn-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    };

    useEffect(() => {
        const theme = localStorage.getItem("sfn-theme");
        if (!theme || theme === "light") {
            return setToggle("light");
        }
        setToggle("dark");
    }, []);

    return (
        <div className="flex items-center justify-center">
            {!["light", ""].includes(toggle) ? (
                <button
                    type="button"
                    aria-label={t("switchToLight")}
                    data-set-theme=""
                    data-act-class="ACTIVECLASS"
                    onClick={() => handleClick("light")}
                    className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-[color,transform] duration-150 ease-out hover:text-secondary-2 active:scale-[0.96]"
                >
                    <Sun aria-hidden="true" className="size-6" strokeWidth={2} />
                </button>
            ) : (
                <button
                    type="button"
                    aria-label={t("switchToDark")}
                    data-set-theme="dark"
                    data-act-class="ACTIVECLASS"
                    onClick={() => handleClick("dark")}
                    className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-[color,transform] duration-150 ease-out hover:text-secondary-2 active:scale-[0.96]"
                >
                    <Moon aria-hidden="true" className="size-6" strokeWidth={2} />
                </button>
            )}
        </div>
    );
}

export default DarkMode;
