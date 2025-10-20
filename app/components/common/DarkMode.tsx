"use client";
import { useState, useEffect } from "react";
import { themeChange } from "theme-change";
import { MdDarkMode, MdWbSunny } from "react-icons/md";

function DarkMode() {
    const [toggle, setToggle] = useState<string>("");
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
        <div className="flex justify-center py-2 ">
            {!["light", ""].includes(toggle) ? (
                <button aria-label="Light mode" data-set-theme="" data-act-class="ACTIVECLASS" onClick={() => handleClick("light")} className="btn p-0 flex items-center bg-neutral-100">
                    <MdWbSunny className="fill-neutral-800 text-2xl sm:text-3xl hover:fill-secondary-2 duration-300" />
                </button>
            ) : (
                <button aria-label="Dark mode" data-set-theme="dark" data-act-class="ACTIVECLASS" onClick={() => handleClick("dark")} className="btn p-0 flex items-center bg-neutral-100">
                    <MdDarkMode className="fill-neutral-800 text-2xl sm:text-3xl hover:fill-secondary-2 duration-300" />
                </button>
            )}
        </div>
    );
}

export default DarkMode;
