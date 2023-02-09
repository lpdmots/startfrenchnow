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

    const handleClick = (theme: string) => {
        setToggle(theme);
        localStorage.setItem("sfn-theme", theme);
    };

    useEffect(() => {
        const theme = localStorage.getItem("sfn-theme");
        if (!theme || theme === "light") {
            return setToggle("light");
        }
        setToggle("dark");
    }, []);

    return (
        <div className="flex justify-center">
            {["light", ""].includes(toggle) ? (
                <button data-set-theme="dark" data-act-class="ACTIVECLASS" onClick={() => handleClick("dark")} className="btn p-0 flex items-center bg-neutral-100 mr-4 ">
                    <MdDarkMode className="fill-neutral-800 text-2xl sm:text-3xl" />
                </button>
            ) : (
                <button data-set-theme="" data-act-class="ACTIVECLASS" onClick={() => handleClick("light")} className="btn p-0 flex items-center bg-neutral-100 mr-4">
                    <MdWbSunny className="fill-neutral-800 text-2xl sm:text-3xl" />
                </button>
            )}
        </div>
    );
}

export default DarkMode;
