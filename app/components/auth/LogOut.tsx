"use client";
import { signOut } from "next-auth/react";
import React from "react";

export const LogOut = ({ logout }: { logout: string }) => {
    return (
        <p onClick={() => signOut()} className="nav-link header-nav-link !p-2 !mb-0 cursor-pointer">
            {logout}
        </p>
    );
};
