import React from "react";
import { FaCommentDots, FaStar, FaStarHalfAlt, FaUserGraduate } from "react-icons/fa";

function MarqueeContent() {
    return (
        <div className="w-full flex justify-around bg-neutral-800">
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
        </div>
    );
}

export default MarqueeContent;

{
    /* <div className="w-full flex justify-around">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-8 justify-center items-center p-2">
                <p className="font-bold mb-0">Students</p>
                <p className="font-extrabold text-2xl  mb-0">10,2K</p>
                <FaUserGraduate className=" text-3xl " />
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-8 justify-center items-center p-2">
                <p className="font-bold mb-0">Comments</p>
                <p className="font-extrabold text-2xl  mb-0">1,560</p>
                <FaCommentDots className=" text-3xl " />
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-8 justify-between items-center p-2">
                <p className="font-bold mb-0">Stars</p>
                <p className="font-extrabold text-2xl  mb-0">4.8</p>
                <div className="flex flex-grow items-center">
                    <FaStar className="text-xl md:text-2xl " />
                    <FaStar className="text-xl  md:text-2xl" />
                    <FaStar className="text-xl  md:text-2xl" />
                    <FaStar className="text-xl  md:text-2xl" />
                    <FaStarHalfAlt className="text-xl  md:text-2xl " />
                </div>
            </div>
        </div> */
}
