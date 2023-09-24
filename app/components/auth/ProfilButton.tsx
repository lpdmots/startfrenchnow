"use client";
import { FaRegUser, FaUserGraduate } from "react-icons/fa";
import Link from "next-intl/link";
import DropdownMenu from "../common/DropdownMenu";
import { LogOut } from "./LogOut";
import { useSession } from "next-auth/react";
import { usePathname } from "next-intl/client";
import { BsConeStriped } from "react-icons/bs";

export const ProfilButton = ({ contact, logout }: { contact: string; logout: string }) => {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session)
        return (
            <Link href={"/auth/signIn?callbackUrl=" + pathname} className="nav-link header-nav-link !p-2 !pb-0">
                <FaRegUser className="text-2xl sm:text-3xl" />
            </Link>
        );

    const dropdownProfil = {
        content: (
            <div className="card p-4 mt-2">
                <div className="flex flex-col gap-2" style={{ minWidth: 125 }}>
                    <div>
                        <span className="flex items-center color-neutral-500 opacity-25 font-bold">
                            <BsConeStriped className="text-xl" style={{ marginRight: 4 }} />
                            {contact}
                        </span>
                    </div>
                    <div>
                        <LogOut logout={logout} />
                    </div>
                </div>
            </div>
        ),
        button: (
            <div className="p-2 pb-0 cursor-pointer">
                <FaUserGraduate className="text-2xl sm:text-3xl hover:fill-secondary-2 duration-300" style={{ color: "var(--neutral-800)" }} />
            </div>
        ),
    };

    return (
        <DropdownMenu content={dropdownProfil.content}>
            <div>{dropdownProfil.button}</div>
        </DropdownMenu>
    );
};
