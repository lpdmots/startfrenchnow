import Image from "next/image";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div
                                id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-not-found"
                                className="position-absolute relative leading-[437px] font-bold left-[0%] top-[0%] right-auto bottom-auto mt-[-11%] ml-[4%] max-[991px]:left-auto max-[991px]:top-auto max-[991px]:bottom-auto max-[991px]:mt-[0%] max-[991px]:ml-[0%] max-[767px]:text-[120px] max-[479px]:text-[100px] max-[479px]:leading-[100px] max-[479px]:top-[18%]"
                            >
                                <div className="text-[var(--neutral-400)] text-[25.8vw] leading-[1.181em] font-bold min-[1440px]:text-[370px] max-[991px]:text-[47vw] max-[991px]:text-center">
                                    404
                                </div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex-horizontal position-relative">
                                    <div className="image-wrapper w-32 md:w-56 lg:w-80 relative h-32 md:h-56 lg:h-80">
                                        <Image
                                            src="/images/page-not-found-icon-paperfolio-webflow-template.svg"
                                            fill
                                            loading="eager"
                                            alt="Page introuvable"
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                </div>
                                <div className="inner-container _600px---tablet center">
                                    <div className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <div className="display-1 mg-bottom-8px">Oops...</div>
                                        <h1 className="display-2">Page introuvable</h1>
                                        <p className="mg-bottom-32px">
                                            Cette page n&apos;existe pas ou a ete deplacee.
                                        </p>
                                        <div className="buttons-row center">
                                            <Link href="/" className="btn-primary full-width w-button">
                                                Retour a l&apos;accueil
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
    );
}
