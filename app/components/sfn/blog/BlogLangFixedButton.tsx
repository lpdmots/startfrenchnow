"use client";
import { useSfnStore } from "@/app/stores/sfnStore";
import Image from "next/image";
import { usePathname, useRouter } from "next-intl/client";
import { useState, useEffect } from "react";

const BlogLangFixedButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { postLang, updatePostLang } = useSfnStore();
    const pathname = usePathname();
    const router = useRouter();

    // Gérer l'affichage du bouton en fonction du scroll
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Fonction pour remonter en haut de la page
    const handleLanguage = (value: "fr" | "en") => {
        updatePostLang(value);
        router.push(pathname + "?postLang=" + value);
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    return (
        isVisible && (
            <button
                className="fixed bottom-14 md:bottom-20 right-4 roundButton small z-50"
                style={{ backgroundColor: "transparent", boxShadow: "0px 0px 5px 0 var(--neutral-500)", opacity: 1, padding: 0, overflow: "hidden" }}
                onClick={() => handleLanguage(postLang === "fr" ? "en" : "fr")}
                aria-label="Retour en haut"
            >
                {postLang === "fr" ? (
                    <Image src="/images/royaume-uni.png" height={70} width={70} alt="UK flag" style={{ height: "100%", objectFit: "cover" }} />
                ) : (
                    <Image src="/images/france.png" height={70} width={70} alt="french flag" style={{ height: "100%", objectFit: "cover" }} />
                )}
            </button>
        )
    );
};

export default BlogLangFixedButton;
