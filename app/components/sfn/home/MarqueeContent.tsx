import React from "react";
import { FacebookBig, FacebookSmall } from "../../common/logos/Facebook";
import { InstagramBig, InstagramSmall } from "../../common/logos/Instagram";
import { TiktokBig, TiktokSmall } from "../../common/logos/Tiktok";
import { UdemyBig, UdemySmall } from "../../common/logos/Udemy";
import { YoutubeBig, YoutubeSmall } from "../../common/logos/Youtube";
import Link from "next-intl/link";

function MarqueeContent() {
    return (
        <div className="w-full flex justify-around items-center bg-neutral-800 gap-12 lg:gap-24 px-6 lg:px-12">
            <div className="hidden lg:flex flex-col justify-center">
                <Link href="https://www.youtube.com/@startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <YoutubeBig height={35} width={150} />
                </Link>
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <Link href="https://www.facebook.com/groups/1274260010235504/" target="_blank" style={{ lineHeight: 0 }}>
                    <FacebookBig height={60} width={150} />
                </Link>
            </div>
            <div className="hidden lg:flex flex-col justify-center mt-2">
                <Link href="https://www.instagram.com/startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <InstagramBig height={48} width={150} />
                </Link>
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <Link href="https://www.udemy.com/user/yohann-coussot/" target="_blank" style={{ lineHeight: 0 }}>
                    <UdemyBig height={50} width={150} />
                </Link>
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <Link href="https://www.tiktok.com/@startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <TiktokBig height={100} width={180} />
                </Link>
            </div>

            <div className="lg:hidden flex flex-col justify-center">
                <Link href="https://www.udemy.com/user/yohann-coussot/" target="_blank" style={{ lineHeight: 0 }}>
                    <UdemySmall height={50} width={50} />
                </Link>
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <Link href="https://www.tiktok.com/@startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <TiktokSmall height={50} width={50} />
                </Link>
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <Link href="https://www.youtube.com/@startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <YoutubeSmall height={50} width={50} />
                </Link>
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <Link href="https://www.facebook.com/groups/1274260010235504/" target="_blank" style={{ lineHeight: 0 }}>
                    <FacebookSmall height={50} width={50} />
                </Link>
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <Link href="https://www.instagram.com/startfrenchnow" target="_blank" style={{ lineHeight: 0 }}>
                    <InstagramSmall height={50} width={50} />
                </Link>
            </div>
        </div>
    );
}

export default MarqueeContent;
