import { Layers } from "lucide-react";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { LuFileText, LuUserCheck } from "react-icons/lu";

export default function MarqueeMockExamsContent() {
    return (
        <div className="flex w-full items-center justify-around gap-12 px-6 text-neutral-100 lg:gap-24 lg:px-12">
            <div className="flex flex-col items-center justify-center">
                <Layers className="h-14 w-auto object-contain" strokeWidth={1.6} />
                <p className="mb-0">Test FIDE complet</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <HiOutlineShieldCheck className="h-14 w-auto object-contain" />
                <p className="mb-0">Format test FIDE</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <LuFileText className="h-14 w-auto object-contain" strokeWidth={1.6} />
                <p className="mb-0">PDF + vidéos</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <LuUserCheck className="h-14 w-auto object-contain" strokeWidth={1.6} />
                <p className="mb-0">Retour professeur</p>
            </div>
        </div>
    );
}
