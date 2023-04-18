import { Effect, Modifier } from "@/app/types/stories/effect";
import { Extract } from "@/app/types/stories/element";

export function removeDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeDuplicatesObjects<T extends object>(objectsList: T[], fieldName: keyof T): T[] {
    return objectsList.filter((value: T, index: number, self: T[]) => index === self.findIndex((t: T) => t[fieldName] === value[fieldName]));
}

type AllowedTypes = Extract | Effect | Modifier | { code: string };

export function sortByCode<T extends AllowedTypes[]>(array: T): T {
    const toNumber = (code: string) => {
        return parseInt(
            code
                .split(".")
                .map((n: string) => +n + 100000)
                .join(".")
        );
    };

    return array.sort((a, b) => toNumber(a.code) - toNumber(b.code)) as T;
}

export function splitArrayIntoChunks<T>(inputArray: T[], chunkSize: number = 6): T[][] {
    let result: T[][] = [];

    for (let i = 0; i < inputArray.length; i += chunkSize) {
        result.push(inputArray.slice(i, i + chunkSize));
    }

    return result;
}

export function rangeFromString(input: string): number[] {
    const [startStr, endStr] = input.split("-").map((s) => s.trim());
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid input format. Expected format: "X-Y", where X and Y are integers.');
    }

    const result: number[] = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }

    return result;
}
