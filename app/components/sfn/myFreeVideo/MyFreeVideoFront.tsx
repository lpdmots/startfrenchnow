"use client";
import { getSubscriber, updateSubscriber } from "@/app/lib/apiNavigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent, ChangeEvent, Dispatch, SetStateAction } from "react";
import Spinner from "@/app/components/common/Spinner";
import { useRouter } from "@/i18n/navigation";

interface State {
    subscriberId: string | null;
    subscriberGroups: string[];
    unknownSub: boolean;
    error: boolean;
}

const initialValue = {
    subscriberId: null,
    subscriberGroups: [],
    unknownSub: false,
    error: false,
};

export function MyFreeVideoFront({ translation }: { translation: any }) {
    const [state, setState] = useState<State>(initialValue);
    const { subscriberId, unknownSub, error } = state;

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
        <main className="min-h-screen bg-[#F5F5F5] flex items-start">
            <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 pt-8 md:pt-12 pb-14 md:pb-20">
                <section className="relative mx-auto w-full max-w-[760px] rounded-[28px] border border-neutral-200 bg-white/95 p-6 sm:p-8 md:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur">
                    {children}
                </section>
            </div>
        </main>
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
            <div className="mb-8 flex justify-center w-full">
                <div className="relative h-[120px] w-[128px] sm:h-[150px] sm:w-[160px]">
                    <Image src="/images/home-hero-image-paperfolio-webflow-template.svg" priority fill alt="Free video" className="object-contain" />
                </div>
            </div>
            <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-neutral-950">{translation["title"]}</h1>
            <p className="mt-3 text-center text-base md:text-lg text-neutral-700">{translation["description"]}</p>
            <div className="mt-8 grid grid-cols-1 gap-4">
                <input
                    type="email"
                    className="h-12 rounded-xl border border-neutral-300 px-4 text-base outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                    value={email}
                    onChange={handleChange}
                    placeholder={translation["emailPlaceholder"]}
                    required
                />
                <button type="submit" className="btn btn-primary w-full justify-center">
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
            <div className="mb-8 flex justify-center w-full">
                <div className="relative h-[120px] w-[120px] sm:h-[150px] sm:w-[150px]">
                    <Image src="/images/password-protected-paperfolio-webflow-template.svg" alt="Not found subscriber" fill className="object-contain" />
                </div>
            </div>
            <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-neutral-950">{translation.title}</h1>
            <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex justify-center items-center">
                    <p className="text-center text-base md:text-lg text-neutral-700">{translation.description}</p>
                </div>
                <button onClick={handleTryAgain} className="btn btn-primary w-full justify-center">
                    {translation.tryAgainBtn}
                </button>
                <Link href="/" className="btn w-full justify-center border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50">
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
            <div className="mb-8 flex justify-center w-full">
                <div className="relative h-[120px] w-[120px] sm:h-[150px] sm:w-[150px]">
                    <Image src="/images/page-not-found-icon-paperfolio-webflow-template.svg" fill alt="Error" className="object-contain p-3" />
                </div>
            </div>
            <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-neutral-950">{translation.title}</h1>
            <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex justify-center items-center">
                    <p className="text-center text-base md:text-lg text-neutral-700">{translation.description}</p>
                </div>
                <button onClick={handleTryAgain} className="btn btn-primary w-full justify-center">
                    {translation.tryAgainBtn}
                </button>
                <Link href="/contact" className="btn w-full justify-center border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50">
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
            <div className="mb-8 flex justify-center w-full">
                <div className="relative h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] rounded-full bg-[#F4E84A] p-3">
                    <Image src="/images/about-me-image-paperfolio-webflow-template.svg" loading="eager" fill alt="Choose your video" className="object-contain" />
                </div>
            </div>
            <h1 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-neutral-950">{translation.title}</h1>
            <p className="mt-3 text-center text-base md:text-lg text-neutral-700">{translation.description}</p>
            <div className="mt-8 grid grid-cols-1 gap-4">
                <button className="btn btn-primary w-full justify-center" onClick={() => handleClick("mon-premier-cours-pour-debutants")}>
                    {isLoading === "mon-premier-cours-pour-debutants" ? <Spinner radius maxHeight="40px" /> : translation.btnBeginner}
                </button>
                <button className="btn btn-primary w-full justify-center" onClick={() => handleClick("cours-pour-les-low-intermediaires")}>
                    {isLoading === "cours-pour-les-low-intermediaires" ? <Spinner radius maxHeight="40px" /> : translation.btnIntermediate}
                </button>
            </div>
        </div>
    );
};
