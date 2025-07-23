"use client";
import { signOut } from "next-auth/react";
import React from "react";
import { FaCaretRight } from "react-icons/fa";

export const LogOut = ({ logout }: { logout: string }) => {
    return (
        <p onClick={() => signOut()} className="nav-link header-nav-link p-1 m-0 font-medium flex items-center cursor-pointer">
            <FaCaretRight />
            {logout}
        </p>
    );
};
