import { COLORVARIABLES } from "@/app/lib/constantes";
import React from "react";
import { BsCaretRightFill } from "react-icons/bs";

interface Props {
    titles: string;
    column1: string;
    column2: string;
    color: "yellow" | "blue" | "red" | "purple" | "green";
}

function TabelVoc({ titles, column1, column2, color }: Props) {
    const titlesList = titles.split("|").map((title) => title.trim());
    const column1List = column1.split("|").map((x) => x.trim());
    const column2List = column2.split("|").map((x) => x.trim());
    const colorVar = COLORVARIABLES[color || "blue"];

    if (titlesList.length !== 2) return <p>Il doit y avoir deux titres</p>;
    if (column1List.length !== column2List.length) return <p>Il n'y a pas le même nombre de mots dans les deux colonnes...</p>;

    return (
        <div className="inner-container _600px---tablet center py-8">
            <div className="inner-container _500px---mbl center image-wrapper hero-image">
                <table id="customers">
                    <tbody>
                        <tr style={{ borderBottom: "solid 4px var(--neutral-800)", backgroundColor: colorVar }}>
                            <th>
                                <span className="pl-0 sm:pl-4">{titlesList[0]}</span>
                            </th>
                            <th>
                                <span className="pr-0 sm:pr-4">{titlesList[1]}</span>
                            </th>
                        </tr>
                        {column1List.map((word1, index) => (
                            <tr key={index}>
                                <td className="flex justify-between items-center">
                                    <span className="pl-0 sm:pl-4">{word1}</span>
                                    <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                </td>
                                <td>
                                    <span className="pr-0 sm:pr-4">{column2List[index]}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TabelVoc;
