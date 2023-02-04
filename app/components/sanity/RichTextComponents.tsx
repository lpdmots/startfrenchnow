import Image from "next/image";
import Link from "next/link";
import urlFor from "../../../lib/urlFor";

export const RichTextComponents = {
    types: {
        image: ({ value }: any) => {
            return (
                <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto my-12" style={{ maxWidth: "700px" }}>
                    <Image src={urlFor(value).url()} height={700} width={700} loading="eager" alt="Blog Post Image" className="image object-contain rounded-lg" />
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
    },
};
