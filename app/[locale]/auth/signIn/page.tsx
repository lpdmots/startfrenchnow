import { FaUserGraduate } from "react-icons/fa";
import Link from "next-intl/link";
import { IoArrowBackOutline } from "react-icons/io5";
import { CredentialsForm } from "@/app/components/auth/CredentialsForm";
import { ContinueWithGoogle } from "@/app/components/auth/ContinueWithGoogle";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const SignIn = ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
    const callbackUrl = searchParams?.callbackUrl || "/";
    const info = searchParams?.info || "";
    const t = useTranslations("Auth.SignIn");
    const tCred = useTranslations("Auth.CredentialsForm");
    const tGoogle = useTranslations("Auth.ContinueWithGoogle");

    const messages = {
        yourEmailAddress: tCred("yourEmailAddress"),
        yourPassword: tCred("yourPassword"),
        logIn: tCred("logIn"),
        forgotPassword: tCred("forgotPassword"),
        credentialsDoNotMatch: tCred("credentialsDoNotMatch"),
        oopsError: tCred("oopsError"),
    };

    const divider = (
        <div className="grid grid-cols-9 w-full my-2">
            <div className="flex items-center col-span-4">
                <div style={{ width: "100%", border: `1px solid ${"var(--neutral-500)"}` }}></div>
            </div>
            <div className="flex items-center">
                <p className="bs flex justify-center mb-0 w-full" style={{ color: "var(--neutral-500)" }}>
                    {t("or")}
                </p>
            </div>
            <div className="flex items-center col-span-4">
                <div style={{ width: "100%", border: `1px solid ${"var(--neutral-500)"}` }}></div>
            </div>
        </div>
    );

    return (
        <div className="flex justify-center items-center min-h-screen w-screen">
            <div className="flex flex-col p-2 sm:p-4 w-full" style={{ maxWidth: 550 }}>
                <div className="card no-hover w-full ">
                    <div className="pd---content-inside-card large !py-6">
                        <div className="mb-6">
                            <div className="image-wrapper rigth-shadow-circle password-page-icon flex justify-center items-center" style={{ height: 75, width: 75 }}>
                                <FaUserGraduate style={{ height: 50, width: 50, color: "var(--neutral-800)" }} />
                            </div>
                        </div>
                        <h1 className="display-2 mg-bottom-12px mb-2">{t.rich("helloAgain", intelRich())}</h1>
                        <p>{t.rich("welcomeBack", intelRich())}</p>
                        {info && (
                            <div className="info-register-message password w-password-page w-form-fail !mx-0 !mt-0 mb-4">
                                <div>{t(`infoMessages.${info}`)}</div>
                            </div>
                        )}
                        <CredentialsForm callbackUrl={callbackUrl as string} messages={messages} />
                        {divider}
                        <ContinueWithGoogle message={tGoogle("label")} />
                    </div>
                </div>

                <div className="flex justify-between items-center w-full mt-4">
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/" className="flex nav-link header-nav-link p-0 mx-0">
                            <IoArrowBackOutline className="text-xl md:text-2xl mr-2" />
                            <p className="mb-0" style={{ marginTop: 2 }}>
                                {t("homepage")}
                            </p>
                        </Link>
                    </div>
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/auth/signUp" className="flex nav-link header-nav-link p-0">
                            <p className="mb-0">{t("createAccount")}</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
