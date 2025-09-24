import { Fade } from "@/app/components/animations/Fades";
import Image from "next/image";
import { ProtectedPage } from "@/app/components/auth/ProtectedPage";
import ClientLessonFetcher from "@/app/components/sfn/privateLessons/ClientLessonFetcher";
import { ReservationList } from "@/app/components/sfn/privateLessons/ReservationList";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { Locale } from "@/i18n";

function PrivateLessons({ params: { slug, locale } }: { params: { slug: string; locale: Locale } }) {
    const tPrivateLessons = useTranslations("Fide.dashboard.PrivateLessons");

    return (
        <ProtectedPage callbackUrl={`/private-lessons/${slug}`} messageInfo="privateLessons">
            <div className="w-full flex flex-col items-center gap-24 mt-8 md:mt-12 overflow-hidden pb-2">
                <div className="max-w-7xl m-auto relative px-2 md:px-4">
                    <div className="max-w-3xl py-8 md:py-12 text-center">
                        <div className="flex flex-col items-center gap-4 md:gap-8">
                            <div>
                                <h1 className="display-1">{tPrivateLessons.rich("title", intelRich())}</h1>
                            </div>

                            <ClientLessonFetcher eventType={"Fide Preparation Class"} />
                        </div>
                    </div>
                    <Fade>
                        <div className="hidden md:block absolute -left-72 bottom-0 left-shadow-1 rounded-full">
                            <Image src="/images/swissflag3.png" width={270} height={270} alt="about teacher image" className="object-contain rounded-full" style={{ border: "3px solid black" }} />
                        </div>
                    </Fade>
                    <Fade>
                        <div className="hidden md:block absolute -right-72 top-0 shadow-1 rounded-full">
                            <Image src="/images/calendarfide.png" width={270} height={270} alt="about pencil" className="object-contain rounded-full" style={{ border: "3px solid black" }} />
                        </div>
                    </Fade>
                    <div className="md:hidden flex gap-4 justify-center">
                        <Fade>
                            <div className="left-shadow-1 rounded-full">
                                <Image
                                    src="/images/swissflag3.png"
                                    width={150}
                                    height={150}
                                    alt={"about teacher image"}
                                    className="grid-span-1 object-contain rounded-full"
                                    style={{ border: "3px solid black" }}
                                />
                            </div>
                        </Fade>
                        <Fade>
                            <div className="shadow-1 rounded-full">
                                <Image
                                    src="/images/calendarfide.png"
                                    width={150}
                                    height={150}
                                    alt="about pencil"
                                    className="grid-span-1 object-contain rounded-full"
                                    style={{ border: "3px solid black" }}
                                />
                            </div>
                        </Fade>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-7xl m-auto px-2 md:px-4 py-12 md:py-24">
                <ReservationList eventType={"Fide Preparation Class"} locale={locale} />
            </div>
        </ProtectedPage>
    );
}

export default PrivateLessons;
