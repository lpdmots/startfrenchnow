"use client";
import FreeVideo from "@/app/components/sfn/myFreeVideo/FreeVideo";
import { Video } from "@/app/types/sfn/video";
import { getSubscriber, updateSubscriber } from "@/lib/apiNavigation";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, ChangeEvent, Suspense, Dispatch, SetStateAction } from "react";
import Spinner from "../../../components/common/Spinner";

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

function MyFreeVideo() {
    const [state, setState] = useState<State>(initialValue);
    const { subscriberId, unknownSub, video, error } = state;

    if (video) return <FreeVideo video={video} />;
    if (error)
        return (
            <LayoutWrapper>
                <ErrorLayout setState={setState} />
            </LayoutWrapper>
        );
    if (subscriberId)
        return (
            <LayoutWrapper>
                <VideoChoice state={state} setState={setState} />
            </LayoutWrapper>
        );
    if (unknownSub)
        return (
            <LayoutWrapper>
                <UnknownSub setState={setState} />
            </LayoutWrapper>
        );
    return (
        <LayoutWrapper>
            <EmailInput setState={setState} />
        </LayoutWrapper>
    );
}

export default MyFreeVideo;

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

const queryVideo = groq`
    *[_type=='video' && slug.current == $slug][0]
`;

const EmailInput = ({ setState }: { setState: Dispatch<SetStateAction<State>> }) => {
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const { subscriber } = await getSubscriber(email);
            console.log({ subscriber: subscriber });
            if (subscriber.message) {
                setState((state) => ({ ...state, unknownSub: true }));
            } else if (subscriber.data.fields.video) {
                const slug = subscriber.data.fields.video;
                const video = await client.fetch(queryVideo, { slug });
                setState((state) => ({ ...state, video: video }));
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
            <h1 className="display-2 mg-bottom-12px">Hello subscriber</h1>
            <p className="mg-bottom-24px keep">Enter your email address and take advantage of the free course of your choice.</p>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <input type="email" className="input w-password-page w-input" value={email} onChange={handleChange} placeholder="Enter your email address" />
                <button type="submit" className="btn-primary w-password-page w-button">
                    {isLoading ? <Spinner radius maxHeight="40px" /> : "Enter now"}
                </button>
            </div>
        </form>
    );
};

const UnknownSub = ({ setState }: { setState: Dispatch<SetStateAction<State>> }) => {
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
            <h1 className="display-2 mg-bottom-12px">Unknown address</h1>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <div className="flex justify-center items-center">
                    <p>Sorry but this email address is not in the list.</p>
                </div>
                <button onClick={handleTryAgain} className="btn-primary w-password-page w-button">
                    Try again
                </button>
                <Link href="/" className="btn-secondary w-button">
                    Go to homepage
                </Link>
            </div>
        </>
    );
};

const ErrorLayout = ({ setState }: { setState: Dispatch<SetStateAction<State>> }) => {
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
            <h1 className="display-2 mg-bottom-12px">Oops! Something went wrong...</h1>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <div className="flex justify-center items-center">
                    <p>Sorry but an error has occurred. You can contact me so that I can solve this problem, or try again later.</p>
                </div>
                <button onClick={handleTryAgain} className="btn-primary w-password-page w-button">
                    Try again
                </button>
                <Link href="/contact" className="btn-secondary w-button">
                    Contact me
                </Link>
            </div>
        </>
    );
};

const VideoChoice = ({ state, setState }: { state: State; setState: Dispatch<SetStateAction<State>> }) => {
    const [isLoading, setIsLoading] = useState<string>();

    const handleClick = async (slug: string) => {
        try {
            setIsLoading(slug);
            await updateSubscriber({ fields: { video: slug }, groups: state.subscriberGroups }, state.subscriberId || "");
            const video = await client.fetch(queryVideo, { slug });
            setState((state) => ({ ...state, video }));
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
            <h1 className="display-2 mg-bottom-12px">Make your choice</h1>
            <p className="mg-bottom-24px keep">Choose the free course you want to access</p>
            <div className="w-layout-grid grid-1-column full-width gap-row-24px">
                <button className="btn-primary w-password-page w-button" onClick={(e) => handleClick("mon-premier-cours-pour-debutants")}>
                    {isLoading === "mon-premier-cours-pour-debutants" ? <Spinner radius maxHeight="40px" /> : "I'm a total beginner, I want my first course"}
                </button>
                <button className="btn-primary w-password-page w-button" onClick={(e) => handleClick("cours-pour-les-low-intermediaires")}>
                    {isLoading === "cours-pour-les-low-intermediaires" ? <Spinner radius maxHeight="40px" /> : "I have basics and want to improve my French"}
                </button>
            </div>
        </div>
    );
};
