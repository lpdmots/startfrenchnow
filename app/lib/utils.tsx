import { AllowedComponents } from "@/app/types/stories/effect";

export function removeDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeDuplicatesObjects<T extends object>(objectsList: T[], fieldName: keyof T): T[] {
    return objectsList.filter((value: T, index: number, self: T[]) => index === self.findIndex((t: T) => t[fieldName] === value[fieldName]));
}

export function sortByCode<T extends any[]>(array: T): T {
    const toNumber = (code: string) => {
        return parseInt(
            code
                .split(".")
                .map((n: string) => +n + 100000)
                .join(".")
        );
    };

    return array.sort((a, b) => toNumber(a?.code || "0") - toNumber(b?.code || "0")) as T;
}

export function splitArrayIntoChunks<T>(inputArray: T[], chunkSize: number = 6): T[][] {
    let result: T[][] = [];

    for (let i = 0; i < inputArray.length; i += chunkSize) {
        result.push(inputArray.slice(i, i + chunkSize));
    }

    return result;
}

export function rangeFromString(input: string): number[] {
    const [startStr, endStr] = input.split("/").map((s) => s.trim());
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid input format. Expected format: "X/Y", where X and Y are integers.');
    }

    const result: number[] = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }

    return result;
}

export function convertMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
}

export function partition<T>(array: T[], isValid: (elem: any) => boolean): [T[], T[]] {
    return array.reduce<[T[], T[]]>(
        ([pass, fail], elem) => {
            return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
        },
        [[], []]
    );
}

export function sortByAttribut<T extends Record<string, any>>(array: T[], attribute: keyof T): T[] {
    return array.sort((a, b) => (a[attribute] > b[attribute] ? 1 : -1));
}

export function shuffleArray(array: any[]) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function createSlug(text: string): string {
    const map: { [key: string]: string } = {
        à: "a",
        â: "a",
        ç: "c",
        é: "e",
        è: "e",
        ê: "e",
        ë: "e",
        î: "i",
        ï: "i",
        ô: "o",
        ù: "u",
        û: "u",
    };

    text = text.toLowerCase();

    // Remove accents from characters
    let slug = Array.from(text)
        .map((c) => map[c] || c)
        .join("");

    slug = slug
        .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word characters with dashes
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w-]+/g, "") // Remove all non-word characters
        .replace(/--+/g, "-") // Replace multiple dashes with a single dash
        .replace(/^-+/, "") // Trim dashes from the start of the text
        .replace(/-+$/, ""); // Trim dashes from the end of the text

    return slug;
}

export function isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

export function isValidEmail(email: string): boolean {
    // Expression régulière pour valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Utilisation de test() pour vérifier si l'email correspond à la regex
    return emailRegex.test(email);
}

export const getActivateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
/* 
export const getPathAsParam = (pathname: string | null) => {
    const regex = /\//g;
    return !pathname || pathname === "/" ? "/" : pathname.replace(regex, "_");
};

export const getParamAsPath = (param: string | null) => {
    const regex = /_/g;
    return !param || param === "/" ? "/" : param.replace(regex, "/");
}; */
