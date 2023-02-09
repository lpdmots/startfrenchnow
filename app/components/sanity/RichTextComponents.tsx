import Image from "next/image";
import Link from "next/link";
import urlFor from "../../../lib/urlFor";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const RichTextComponents = {
    types: {
        image: ({ value }: any) => {
            return (
                <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto my-12" style={{ maxWidth: "700px" }}>
                    <Image src={urlFor(value).url()} height={700} width={700} loading="eager" alt="Blog Post Image" className="image object-contain rounded-lg" />
                </div>
            );
        },
        videoBlog: ({ value }: any) => {
            return (
                <div className=" my-12">
                    <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto" style={{ width: "100%", lineHeight: 0 }}>
                        <video className="image-wrapper border-radius-30px" src={cloudFrontDomain + value.s3Key} height="auto" width="100%" controls></video>
                    </div>
                    {value.title && <p className="display-4 w-full text-center pt-6 mb-0">{value.title}</p>}
                </div>
            );
        },
    },
    list: {
        bullet: ({ children }: any) => <ul className="ml-4 sm:ml-10 py-5 list-disc space-y-5">{children}</ul>,
        number: ({ children }: any) => <ol className="mt-lg list-decimal">{children}</ol>,
    },
    block: {
        h1: ({ children }: any) => <h1 className="display-1">{children}</h1>,
        h2: ({ children }: any) => <h2 className="display-2">{children}</h2>,
        h3: ({ children }: any) => <h3 className="display-3">{children}</h3>,
        h4: ({ children }: any) => <h4 className="display-4">{children}</h4>,
        blockquote: ({ children }: any) => <blockquote className="mt-12">{children}</blockquote>,
        hidden: ({ children }: any) => <p className="hidden">{children}</p>,
    },
    marks: {
        link: ({ children, value }: any) => {
            const rel = !value.href.startWith("/") ? "noreferrer noopener" : undefined;
            return (
                <Link href={value.href} rel={rel}>
                    {children}
                </Link>
            );
        },
        hightlightRed: ({ children }: any) => <span className="heading-span-secondary-4">{children}</span>,
        hightlightBlue: ({ children }: any) => <span className="heading-span-secondary-2">{children}</span>,
        hightlightOrange: ({ children }: any) => <span className="heading-span-secondary-1">{children}</span>,
        left: ({ children }: any) => <p style={{ textAlign: "left" }}>{children}</p>,
        center: ({ children }: any) => <p style={{ textAlign: "center" }}>{children}</p>,
        right: ({ children }: any) => <p style={{ textAlign: "right" }}>{children}</p>,
    },
};
