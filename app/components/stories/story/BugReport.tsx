"use client";
import { usePathname, useRouter } from "next/navigation";
import { TbMessageReport } from "react-icons/tb";

const BugReport = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <>
            <div className="flex justify-center py-2 cursor-pointer" onClick={() => router.push(pathname + "/story-report")}>
                <TbMessageReport className="text-3xl sm:text-4xl" />
            </div>
        </>
    );
};

export default BugReport;
