import Link from "next-intl/link";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoMdLock } from "react-icons/io";
import { ContinueWithGoogle } from "@/app/components/auth/ContinueWithGoogle";
import { SignUpForm } from "@/app/components/auth/SignUpForm";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const SignUp = () => {
    const t = useTranslations("Auth.SignUp");
    const tGoogle = useTranslations("Auth.ContinueWithGoogle");
    const tForm = useTranslations("Auth.SignUpForm");
    const tEmail = useTranslations("Auth.Email.activationEmail");

    const messagesForm = {
        enterYourEmail: tForm("enterYourEmail"),
        enterYourUsername: tForm("enterYourUsername"),
        password: tForm("password"),
        confirm: tForm("confirm"),
        subscribeNewsletter: tForm("subscribeNewsletter"),
        createAccount: tForm("createAccount"),
        successMessage: tForm("successMessage"),
        errorMessages: {
            fillAllField: tForm("errorMessages.fillAllField"),
            emailExist: tForm("errorMessages.emailexist"),
            notActivated: tForm("errorMessages.notActivated"),
            emailInvalid: tForm("errorMessages.emailInvalid"),
            passwordMismatch: tForm("errorMessages.passwordMismatch"),
            passwordNotConform: tForm("errorMessages.passwordNotConform"),
            error500: tForm("errorMessages.error500"),
        },
        mailMessages: {
            subject: tEmail.raw("subject"),
            body: tEmail.raw("body"),
        },
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
                <div data-w-id="2078a685-0c58-ebe5-b8d7-ebd2a748e8ad" className="card no-hover">
                    <div className="pd---content-inside-card large !py-6">
                        <div className="mb-6">
                            <div className="image-wrapper rigth-shadow-circle password-page-icon flex justify-center items-center" style={{ height: 75, width: 75 }}>
                                <IoMdLock style={{ height: 50, width: 50, color: "var(--neutral-800)" }} />
                            </div>
                        </div>
                        <h1 className="display-2 mg-bottom-12px mb-4">{t.rich("signUp", intelRich())}</h1>

                        <SignUpForm messages={messagesForm} />
                        {divider}
                        <ContinueWithGoogle message={tGoogle("label")} />
                    </div>
                </div>

                <div className="flex justify-between items-center w-full mt-4">
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/" className="flex nav-link header-nav-link p-0">
                            <IoArrowBackOutline className="text-xl md:text-2xl mr-2" />
                            <p className="mb-0" style={{ marginTop: 2 }}>
                                {t("homepage")}
                            </p>
                        </Link>
                    </div>
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/auth/signIn" className="flex nav-link header-nav-link p-0">
                            <p className="mb-0">{t("alreadyAccount")}</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
