"use client";
import React, { useState, useRef } from "react";
import styled from "styled-components";
import useOutsideClick from "../../hooks/useOutsideClick";
import { usePathname } from "next/navigation";
import Link from "next/link";

const StyledBurger = styled.div`
    width: 2.3rem;
    height: 2.3rem;
    display: none;
    cursor: pointer;
    @media (max-width: 991px) {
        display: flex;
        justify-content: space-around;
        flex-flow: column nowrap;
    }
    div {
        width: 2.3rem;
        height: 3px;
        background-color: var(--neutral-800);
        border-radius: 10px;
        transform-origin: 1px;
        transition: all 0.2s linear;
        &:nth-child(1) {
            transform: ${({ open }) => (open ? "rotate(45deg)" : "rotate(0)")};
        }
        &:nth-child(2) {
            opacity: ${({ open }) => (open ? 0 : 1)};
        }
        &:nth-child(3) {
            transform: ${({ open }) => (open ? "rotate(-45deg)" : "rotate(0)")};
        }
    }
`;

const Burger = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const pathname = usePathname();

    useOutsideClick(ref, () => {
        setOpen(false);
    });

    return (
        <>
            <StyledBurger open={open} onClick={() => setOpen(!open)}>
                <div />
                <div />
                <div />
            </StyledBurger>

            <div
                ref={ref}
                style={open ? { height: ref.current.scrollHeight + "px", zIndex: 1000 } : { height: "0px", zIndex: 1000 }}
                className="w-screen nav-width mx-auto px-6 absolute left-0 nav-collapse-top collapse-parent"
            >
                <div className="nav burgerCollapse !py-5 w-full mb-0">
                    <ul className="flex-col gap-5 !items-start list-none">
                        <li className="header-nav-list-item middle">
                            <Link href="/" className={`nav-link header-nav-link ${pathname === "/" && "current"}`} onClick={() => setOpen(false)}>
                                Home
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/blog" className={`nav-link header-nav-link ${pathname === "/blog" && "current"}`} onClick={() => setOpen(false)}>
                                Blog
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/about" className={`nav-link header-nav-link ${pathname === "/studio" && "current"}`} onClick={() => setOpen(false)}>
                                About
                            </Link>
                        </li>
                        <li className="header-nav-list-item middle">
                            <Link href="/contact" className={`nav-link header-nav-link ${pathname === "/studio" && "current"}`} onClick={() => setOpen(false)}>
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Burger;
