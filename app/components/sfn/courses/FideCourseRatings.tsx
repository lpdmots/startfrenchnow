"use client";
import { FaUserGraduate } from "react-icons/fa";
import { CompteurIncrement, CompteurStarsIncrement } from "../../common/CompteurIncrement";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import CircularProgressMagic from "../../common/CircularProgressMagic";

export const FideCourseRatings = () => {
    return (
        <div className="flex justify-center w-full">
            <div className="flex justify-around gap-2 md:gap-8 lg:gap-12" style={{ maxWidth: "95vw" }}>
                <Link href="https://fide-service.ch/fr/home" target="_blank" className="w-full md:w-auto flex items-center">
                    <Image src="/images/fideLogo.png" alt="FIDE Logo" width={120} height={50} className="w-auto object-contain" />
                </Link>
                <div className="flex flex-col  justify-center items-center gap-2" style={{ minWidth: 80 }}>
                    <div className="flex flex-col justify-between items-center h-full">
                        <div className="grow flex items-center">
                            <FaUserGraduate className="text-4xl" />
                        </div>
                        <p className="font-bold text-lg mb-0">
                            <CompteurIncrement nombreDeBase={0} nombreFinal={300} defaultDuration={7000} /> +
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <CircularProgressMagic max={100} min={0} value={98} gaugePrimaryColor="var(--secondary-5)" gaugeSecondaryColor="var(--neutral-300)" className="h-[55px] w-20" />
                    <p className="mb-0 font-bold text-lg">Réussite</p>
                </div>
            </div>
        </div>
    );
};
