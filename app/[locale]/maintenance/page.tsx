import { BsConeStriped } from "react-icons/bs";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Learn French at Your Own Pace with Expert-led Video Lessons",
    description:
        "Improve your French language skills with our comprehensive video lessons. We propose a convenient, serious and fun way to learn French as a foreign language and achieve fluency. Start french now!",
};

function Maintenance() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-33543d3f" data-w-id="d245282e-bd6f-ff12-2569-ce176b30a962" className="position-absolute relative leading-[437px] font-bold left-[0%] top-[0%] right-auto bottom-auto mt-[-11%] ml-[4%] max-[991px]:left-auto max-[991px]:top-auto max-[991px]:bottom-auto max-[991px]:mt-[0%] max-[991px]:ml-[0%] max-[767px]:text-[120px] max-[479px]:text-[100px] max-[479px]:leading-[100px] max-[479px]:top-[18%]">
                                <div className="text-[var(--neutral-400)] text-[25.8vw] leading-[1.181em] font-bold min-[1440px]:text-[370px] max-[991px]:text-[47vw] max-[991px]:text-center text-7xl md:text-9xl text-center pt-12" style={{ maxWidth: "500px" }}>
                                    Coming soon
                                </div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex-horizontal position-relative">
                                    <div className="image-wrapper ">
                                        <BsConeStriped className="text-7xl md:text-9xl  text-primary mt-12" />
                                    </div>
                                </div>
                                <div id="w-node-ffe9a45f-94fb-9c90-1679-9bd8e1c7012d-33543d3f" className="inner-container _600px---tablet center">
                                    <div data-w-id="619efe17469a19c94a600b1500000000000b" className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <div className="display-1 mg-bottom-8px">Be patient!</div>
                                        <h1 className="display-2">Something big is coming 😶</h1>
                                        <p className="mg-bottom-32px">But its not ready yet, we are working on it...</p>
                                        <div id="w-node-_43cc762b-abd3-c8a6-16ac-a7037f01a843-33543d3f" className="inner-container max-w-[254px] mt-0 w-full max-[479px]:max-w-full">
                                            <div className="buttons-row center">
                                                <Link href="/" className="btn-primary full-width w-button">
                                                    Go to homepage
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Maintenance;
