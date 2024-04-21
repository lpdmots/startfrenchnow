import React from "react";
import { FacebookBig, FacebookSmall } from "../../common/logos/Facebook";
import { LinkedInBig, LinkedInSmall } from "../../common/logos/LinkedIn";
import { TwitterBig, TwitterSmall } from "../../common/logos/Twitter";
import { UdemyBig, UdemySmall } from "../../common/logos/Udemy";
import { YoutubeBig, YoutubeSmall } from "../../common/logos/Youtube";

function MarqueeContent() {
    return (
        <div className="w-full flex justify-around items-center bg-neutral-800">
            <div className="hidden lg:flex flex-col justify-center">
                <YoutubeBig height={35} width={150} />
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <FacebookBig height={60} width={150} />
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <LinkedInBig height={60} width={150} />
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <UdemyBig height={50} width={150} />
            </div>
            <div className="hidden lg:flex flex-col justify-center">
                <TwitterBig height={50} width={100} />
            </div>

            <div className="lg:hidden flex flex-col justify-center">
                <UdemySmall height={50} width={50} />
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <TwitterSmall height={50} width={50} />
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <YoutubeSmall height={50} width={50} />
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <FacebookSmall height={50} width={50} />
            </div>
            <div className="lg:hidden flex flex-col justify-center">
                <LinkedInSmall height={50} width={50} />
            </div>
        </div>
    );
}

export default MarqueeContent;

/* <div className="w-full flex justify-around bg-neutral-800">
            <div className="flex flex-col justify-center items-center p-2">
                <p className="font-bold">Students</p>
                <p className="font-extrabold text-2xl ">10,2K</p>
                <FaUserGraduate className=" text-3xl mt-2" />
            </div>
            <div className="flex flex-col justify-center items-center p-2">
                <p className="font-bold">Comments</p>
                <p className="font-extrabold text-2xl ">1,560</p>
                <FaCommentDots className=" text-3xl mt-2" />
            </div>
            <div className="flex flex-col justify-between items-center p-2">
                <div>
                    <p className="font-bold">Stars</p>
                    <p className="font-extrabold text-2xl ">4.8</p>
                </div>
                <div className="flex flex-grow items-center">
                    <FaStar className="text-xl md:text-2xl mt-2" />
                    <FaStar className="text-xl  md:text-2xl mt-2" />
                    <FaStar className="text-xl  md:text-2xl mt-2" />
                    <FaStar className="text-xl  md:text-2xl mt-2" />
                    <FaStarHalfAlt className="text-xl  md:text-2xl mt-2" />
                </div>
            </div>
        </div> */
