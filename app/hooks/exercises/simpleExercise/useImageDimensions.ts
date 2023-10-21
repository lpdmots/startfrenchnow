import { getImageDimensions } from "@/app/lib/utils";
import { useEffect, useState } from "react";

const useImageDimensions = (imageRef: string, id: string) => {
    const [minHeight, setMinHeight] = useState(400);

    useEffect(() => {
        const { width, height } = getImageDimensions(imageRef);
        const parentWidth = document.getElementById(id)?.offsetWidth || 0;
        const ratio = parentWidth / width;
        const newHeight = height * ratio;
        setMinHeight(newHeight);
    }, [imageRef, id, setMinHeight]);

    return minHeight;
};

export default useImageDimensions;
