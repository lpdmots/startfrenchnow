"use client";
import React, { useState, useEffect } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface CompteurProps {
    nombreDeBase: number;
    nombreFinal: number | undefined;
}

export const CompteurIncrement = ({ nombreDeBase, nombreFinal }: CompteurProps) => {
    const [valeurActuelle, setValeurActuelle] = useState(nombreDeBase);

    useEffect(() => {
        if (nombreFinal === undefined) return;

        let start: any = null;
        const duration = 2000; // Durée totale de l'animation en ms

        const step = (timestamp: any) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -15 * progress); // Fonction d'easeOutExpo

            setValeurActuelle(nombreDeBase + easeOutProgress * (nombreFinal - nombreDeBase));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);

        return () => {
            start = null;
        };
    }, [nombreDeBase, nombreFinal]);

    return <span>{valeurActuelle.toFixed(0)}</span>;
};

export const renderStars = (rating: number, areBig: boolean = false) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            // Étoile pleine
            stars.push(<FaStar key={i.toString()} className={`${areBig ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"} fill-secondary-1`} />);
        } else if (i - 0.5 <= rating) {
            // Étoile à moitié pleine
            stars.push(<FaStarHalfAlt key={i.toString()} className={`${areBig ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"} fill-secondary-1`} />);
        } else {
            // Étoile vide
            stars.push(<FaRegStar key={i.toString()} className={`${areBig ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"} fill-secondary-1`} />);
        }
    }
    return stars;
};

export const CompteurStarsIncrement: React.FC<CompteurProps> = ({ nombreDeBase, nombreFinal }) => {
    const [valeurActuelle, setValeurActuelle] = useState(nombreDeBase);

    useEffect(() => {
        if (nombreFinal === undefined) return;

        let start: any = null;
        const duration = 2000; // Durée totale de l'animation en ms

        const step = (timestamp: any) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -5 * progress); // Fonction d'easeOutExpo

            const nouvelleValeur = nombreDeBase + easeOutProgress * (nombreFinal - nombreDeBase);
            setValeurActuelle(nouvelleValeur);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);

        return () => {
            start = null;
        };
    }, [nombreDeBase, nombreFinal]);

    return (
        <div className="flex flex-col justify-between items-center gap-2 h-full" style={{ minWidth: 80 }}>
            <p className="font-extrabold text-lg md:text-2xl mb-0">{valeurActuelle.toFixed(1)}</p>
            <div className="flex flex-grow items-center">{renderStars(valeurActuelle)}</div>
        </div>
    );
};
