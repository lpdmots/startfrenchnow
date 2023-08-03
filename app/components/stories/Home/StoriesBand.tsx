import React from "react";
import { FaToolbox } from "react-icons/fa";
import { GiMagnifyingGlass } from "react-icons/gi";
import { IoConstruct } from "react-icons/io5";
import Historical from "../../common/logos/Historical";
import Map from "../../common/logos/Map";
import TourEiffel from "../../common/logos/TourEiffel";

function StoriesBand() {
    return (
        <div className="text-neutral-100 p-1">
            <div className="w-full flex justify-around bg-neutral-800" style={{ marginRight: "7%" }}>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Beta version</p>
                    <IoConstruct style={{ fontSize: 60, color: "var(--neutral-100)" }} />
                </div>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Beta version</p>
                    <FaToolbox style={{ fontSize: 60, color: "var(--neutral-100)" }} />
                </div>
                <div className="hidden sm:flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Beta version</p>
                    <IoConstruct style={{ fontSize: 60, color: "var(--neutral-100)" }} />
                </div>
                <div className="hidden sm:flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Beta version</p>
                    <FaToolbox style={{ fontSize: 60, color: "var(--neutral-100)" }} />
                </div>
            </div>
        </div>
    );
}

export default StoriesBand;

/* function StoriesBand() {
    return (
        <div className="text-neutral-100 p-1">
            <div className="w-full flex justify-around bg-neutral-800" style={{ marginRight: "7%" }}>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Investigation</p>
                    <GiMagnifyingGlass style={{ fontSize: 60, color: "var(--neutral-100)" }} />
                </div>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Culture</p>
                    <TourEiffel height={60} width={60} />
                </div>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Adventure</p>
                    <Map height={60} width={60} />
                </div>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">Historical</p>
                    <Historical height={60} width={60} />
                </div>
            </div>
        </div>
    );
}

export default StoriesBand; */
