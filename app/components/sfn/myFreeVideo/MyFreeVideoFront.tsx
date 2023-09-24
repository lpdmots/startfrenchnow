"use client";
import { Video } from "@/app/types/sfn/video";
import { getSubscriber, updateSubscriber } from "@/app/lib/apiNavigation";
import { client } from "@/app/lib/sanity.client";
import Image from "next/image";
import Link from "next-intl/link";
import { useState, FormEvent, ChangeEvent, Dispatch, SetStateAction } from "react";
import Spinner from "@/app/components/common/Spinner";
import { useRouter } from "next-intl/client";

interface State {
    subscriberId: string | null;
    subscriberGroups: string[];
    unknownSub: boolean;
    video: Video | null;
    error: boolean;
}

const initialValue = {
    subscriberId: null,
    subscriberGroups: [],
    unknownSub: false,
    video: null,
    error: false,
};

export function MyFreeVideoFront({ translation }: { translation: any }) {
    const [state, setState] = useState<State>(initialValue);
    const { subscriberId, unknownSub, video, error } = state;
    console.log({ subscriberId, unknownSub, video, error });

    if (error)
        return (
            <LayoutWrapper>
                <ErrorLayout setState={setState} translation={translation.ErrorLayout} />
            </LayoutWrapper>
        );
    if (subscriberId)
        return (
            <LayoutWrapper>
                <VideoChoice state={state} setState={setState} translation={translation.VideoChoice} />
            </LayoutWrapper>
        );
    if (unknownSub)
        return (
            <LayoutWrapper>
                <UnknownSub setState={setState} translation={translation.UnknownSub} />
            </LayoutWrapper>
        );
    return (
        <LayoutWrapper>
            <EmailInput setState={setState} translation={translation.Form} />
        </LayoutWrapper>
    );
}

const LayoutWrapper = ({ children }: { children: JSX.Element }) => {
    return (
        <div className="utility-page-wrap password-page pt-16">
            <div className="utility-page-content w-password-page w-form">
                <div className="utility-page-form w-password-page">
                    <div className="container-default w-container">
                        <div className="inner-container _600px---mbl center">
                            <div data-w-id="2078a685-0c58-ebe5-b8d7-ebd2a748e8ad" className="card no-hover">
                                <div className="pd---content-inside-card large">{children}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmailInput = ({ setState, translation }: { setState: Dispatch<SetStateAction<State>>; translation: any }) => {
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const { subscriber } = await getSubscriber(email);
            if (subscriber.message) {
                setState((state) => ({ ...state, unknownSub: true }));
            } else if (subscriber.data.fields.video) {
                const slug = subscriber.data.fields.video;
                router.push(`/my-free-video/${slug}/${subscriber.data.id}`);
            } else {
                setState((state) => ({ ...state, subscriberId: subscriber.data.id, subscriberGroups: subscriber.data.groups.map((group: { id: string }) => group.id) }));
            }
            setIsLoading(false);
        } catch (e) {
            console.log({ e });
            setState((state) => ({ ...state, error: true }));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mg-bottom-54px flex justify-center w-full">
                <div className="image-wrapper rigth-shadow-circle password-page-icon">
                    <Image src="/images/home-hero-image-paperfolio-webflow-template.svg" priority height={184} width={196.73} alt="password protected" className="w-full h-auto" />
                </div>
            </div>
            <h1 className="display-2 mg-bottom-12px">{translation["title"]}</h1>
            <p className="mg-bottom-24px keep">{translation["description"]}</p>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <input type="email" className="input w-password-page w-input" value={email} onChange={handleChange} placeholder={translation["emailPlaceholder"]} />
                <button type="submit" className="btn-primary w-password-page w-button">
                    {isLoading ? <Spinner radius maxHeight="40px" /> : translation["submitBtn"]}
                </button>
            </div>
        </form>
    );
};

const UnknownSub = ({ setState, translation }: { setState: Dispatch<SetStateAction<State>>; translation: any }) => {
    const handleTryAgain = () => {
        setState(initialValue);
    };

    return (
        <>
            <div className="mg-bottom-54px flex justify-center w-full">
                <div className="image-wrapper rigth-shadow-circle password-page-icon">
                    <Image src="/images/password-protected-paperfolio-webflow-template.svg" alt="password protected" width="184" height="184" className="image" style={{ width: "auto" }} />
                </div>
            </div>
            <h1 className="display-2 mg-bottom-12px">{translation.title}</h1>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <div className="flex justify-center items-center">
                    <p>{translation.description}</p>
                </div>
                <button onClick={handleTryAgain} className="btn-primary w-password-page w-button">
                    {translation.tryAgainBtn}
                </button>
                <Link href="/" className="btn-secondary w-button">
                    {translation.goHomeBtn}
                </Link>
            </div>
        </>
    );
};

const ErrorLayout = ({ setState, translation }: { setState: Dispatch<SetStateAction<State>>; translation: any }) => {
    const handleTryAgain = () => {
        setState(initialValue);
    };

    return (
        <>
            <div className="mg-bottom-54px flex justify-center w-full">
                <div className="image-wrapper rigth-shadow-circle password-page-icon">
                    <Image src="/images/page-not-found-icon-paperfolio-webflow-template.svg" height={184} width={184} alt="password protected" className="p-8" style={{ height: "100%" }} />
                </div>
            </div>
            <h1 className="display-2 mg-bottom-12px">{translation.title}</h1>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <div className="flex justify-center items-center">
                    <p>{translation.description}</p>
                </div>
                <button onClick={handleTryAgain} className="btn-primary w-password-page w-button">
                    {translation.tryAgainBtn}
                </button>
                <Link href="/contact" className="btn-secondary w-button">
                    {translation.contactBtn}
                </Link>
            </div>
        </>
    );
};

const VideoChoice = ({ state, setState, translation }: { state: State; setState: Dispatch<SetStateAction<State>>; translation: any }) => {
    const [isLoading, setIsLoading] = useState<string>();
    const router = useRouter();

    const handleClick = async (slug: string) => {
        try {
            setIsLoading(slug);
            await updateSubscriber({ fields: { video: slug }, groups: state.subscriberGroups }, state.subscriberId || "");
            router.push(`/my-free-video/${slug}/${state.subscriberId}`);
        } catch (e) {
            console.log({ e });
            setState((state) => ({ ...state, error: true }));
        }
    };

    return (
        <div>
            <div className="mg-bottom-54px flex justify-center w-full">
                <div className="image-wrapper rigth-shadow-circle password-page-icon relative bg-secondary-2">
                    <Image src="/images/about-me-image-paperfolio-webflow-template.svg" loading="eager" height={184} width={184} alt="password protected" style={{ height: "100%" }} />
                </div>
            </div>
            <h1 className="display-2 mg-bottom-12px">{translation.title}</h1>
            <p className="mg-bottom-24px keep">{translation.description}</p>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <button className="btn-primary w-password-page w-button" onClick={(e) => handleClick("mon-premier-cours-pour-debutants")}>
                    {isLoading === "mon-premier-cours-pour-debutants" ? <Spinner radius maxHeight="40px" /> : translation.btnBeginner}
                </button>
                <button className="btn-primary w-password-page w-button" onClick={(e) => handleClick("cours-pour-les-low-intermediaires")}>
                    {isLoading === "cours-pour-les-low-intermediaires" ? <Spinner radius maxHeight="40px" /> : translation.btnIntermediate}
                </button>
            </div>
        </div>
    );
};
