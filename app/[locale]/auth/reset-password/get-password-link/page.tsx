import { SlideFromBottom } from "@/app/components/animations/Slides";
import { GetNewLink } from "@/app/components/auth/GetNewLink";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const GetPasswordLink = () => {
    const t = useTranslations("Auth.GetPasswordLink");
    const tLink = useTranslations("Auth.GetNewLink");
    const tEmail = useTranslations("Auth.Email");

    const messages = {
        placeholder: tLink("placeholder"),
        btnGetLink: tLink("btnGetLink"),
        errorEmptyEmail: tLink("errorEmptyEmail"),
        successMessage: tLink("successMessage"),
        errorMessage: tLink("errorMessage"),
        ResetPasswordMail: {
            subject: tEmail("ResetPasswordMail.subject"),
            body: tEmail.raw("ResetPasswordMail.body"),
        },
    };

    return (
        <main className="min-h-screen bg-[#F5F5F5] flex items-center">
            <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-28 min-h-[640px] md:min-h-[760px]">
                <div className="absolute top-0 left-0 pointer-events-none select-none">
                    <span className="block font-bold leading-none text-neutral-400/35 text-[42vw] md:text-[26vw] lg:text-[420px]">
                        ****
                    </span>
                </div>
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] items-center md:items-end gap-10 md:gap-20 lg:gap-28 md:min-h-[520px]">
                    <div className="order-1 flex justify-center md:justify-center md:self-center">
                        <SlideFromBottom>
                            <div className="image-wrapper rigth-shadow-circle h-[170px] w-[170px] sm:h-[220px] sm:w-[220px] md:h-[300px] md:w-[300px] lg:h-[360px] lg:w-[360px]">
                                <Image
                                    src="/images/password-protected-paperfolio-webflow-template.svg"
                                    height={360}
                                    width={360}
                                    alt="Password protected"
                                    className="image object-contain"
                                    priority
                                />
                            </div>
                        </SlideFromBottom>
                    </div>
                    <div className="order-2 text-center md:text-left md:self-end md:justify-self-end md:max-w-[560px] md:pb-6">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">{t("title")}</h1>
                        <p className="mt-3 text-2xl md:text-3xl font-semibold text-neutral-900">{t("subtitle")}</p>
                        <p className="mt-6 text-lg leading-relaxed text-neutral-700">{t("instruction")}</p>
                        <div className="mt-8 flex justify-center md:justify-start w-full">
                            <GetNewLink linkFor="resetPassword" messages={messages} />
                        </div>
                        <div className="mt-8 flex justify-center md:justify-start">
                            <Link href="/auth/signIn" className="btn btn-primary full-width w-button w-full max-w-[360px] text-center">
                                {t("returnToLogin")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default GetPasswordLink;
