"use client";

import { langData } from "@/app/lib/constantes";
import { Locale } from "@/i18n";
import { usePathname, useRouter } from "next-intl/client";
import Image from "next/image";
import { useTransition } from "react";
import DropdownMenu from "./DropdownMenu";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();

    function handleClick(nextLocale: Locale) {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    const dropdownProfil = {
        content: (
            <div className="card py-2 px-4 mt-2">
                <div className="flex flex-col gap-1">
                    {Object.entries(langData).map(([localeKey, values]) => {
                        const isActive = localeKey === locale;
                        return (
                            <div key={localeKey} className={`flex items-center hover:cursor-pointer ${isActive && "hover:cursor-default opacity-30"}`} onClick={() => handleClick(localeKey as Locale)}>
                                <Image src={values.image} className="h-6 sm:h-8 lg:h-9 object-contain p-1" height={35} width={35} alt={values.alt} />
                                <p className="ml-2 mb-0">{values.abreviation}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        ),
        button: (
            <div className={`flex items-center cursor-pointer sm:mr-2 ${isPending && "transition-opacity [&:disabled]:opacity-30"}`}>
                <Image src={langData[locale].image} className="h-6 sm:h-8 lg:h-9 object-contain p-1" height={35} width={35} alt={langData[locale].image} />
            </div>
        ),
    };

    return (
        <DropdownMenu content={dropdownProfil.content}>
            <div>{dropdownProfil.button}</div>
        </DropdownMenu>
    );
}
