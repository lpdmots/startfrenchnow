import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { NewsletterCardForm } from "./NewsletterCardForm";
import { getFormMessages } from "./NewsletterFooter";

function NewsletterCard() {
    const t = useTranslations("Newsletter");
    const formMessages = getFormMessages(t);

    return (
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="flex max-w-[388px] p-[45px_32px_55px] flex-col justify-start items-center rounded-[24px] bg-[var(--primary)] shadow-[10px_10px_0_0_var(--neutral-800)] max-[991px]:max-w-full max-[991px]:pr-[40px] max-[991px]:pl-[40px] max-[767px]:p-[40px_34px_50px] max-[479px]:pr-[24px] max-[479px]:pl-[24px] max-[479px]:justify-center">
            <div className="mg-bottom-24px">
                <Image src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={92} width={92} loading="eager" alt="get in touch image" />
            </div>
            <div className="text-center mg-bottom-24px">
                <div className="inner-container max-[991px]:max-w-[400px] center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mg-bottom-8px">{t.rich("title", intelRich())}</h2>
                        <div className="flex items-center">
                            <span className="mb-0">{t("description")}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex w-full min-h-[160px] mb-0 flex-col justify-center max-[991px]:min-h-[156px] max-[767px]:min-h-[136px] w-form">
                <NewsletterCardForm formMessages={formMessages} />
            </div>
        </div>
    );
}

export default NewsletterCard;
