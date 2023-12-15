export function removeDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeDuplicatesObjects<T extends object>(objectsList: T[], fieldName: keyof T): T[] {
    return objectsList.filter((value: T, index: number, self: T[]) => index === self.findIndex((t: T) => t[fieldName] === value[fieldName]));
}

export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
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

export function shuffleArray<T>(array: T[]): T[] {
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

    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber;
}

export function isValidEmail(email: string): boolean {
    // Expression régulière pour valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Utilisation de test() pour vérifier si l'email correspond à la regex
    return emailRegex.test(email);
}

export const getActivateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export function replaceInString(template: string, variables: any) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(key, "g");
        result = result.replace(placeholder, value as string);
    }
    return result;
}

export const getDataInRightLang = <T extends object>(item: T, lang: "en" | "fr", attribute: keyof T) => {
    const attrString = String(attribute); // Explicitly convert to string

    if (lang === "fr" && item[attribute]) {
        return item[attribute] as string | undefined;
    }
    if (lang === "fr" && !item[attribute]) {
        return item[`${attrString}_en` as keyof T] as string | undefined;
    }
    if (lang === "en" && item[`${attrString}_en` as keyof T]) {
        return item[`${attrString}_en` as keyof T] as string | undefined;
    }
    return item[attribute] as string | undefined;
};

export function formatStringToNoWrap(input: string): JSX.Element {
    if (!input) return <span></span>;
    const words = input.split(" ");

    const lastTwoWords = words.slice(-1).join(" ");
    const stringStart = words.slice(0, -1).join(" ");

    return (
        <span>
            {stringStart}
            <span className="text-no-wrap"> {lastTwoWords}</span>
        </span>
    );
}

export function replaceWord(text: string, targetWord: string, replacementWord: string, numOccurrences: number) {
    let counter = 0;
    let position = 0;

    while (counter < numOccurrences) {
        position = text.indexOf(targetWord, position);
        if (position === -1) {
            break;
        }
        text = text.substring(0, position) + replacementWord + text.substring(position + targetWord.length);
        position += replacementWord.length;
        counter++;
    }

    return text;
}

export const splitAndKeepMultipleKeywords = (text: string, keywordPairs: { keyword: string; keywordReplace: string; maxKeyword?: number }[]) => {
    // Remplacer et conserver les mots-clés dans le texte
    let replacedText = text;
    keywordPairs.forEach(({ keyword, keywordReplace, maxKeyword }) => {
        replacedText = replaceWord(replacedText, keyword, `<>${keywordReplace}<>`, maxKeyword || Infinity);
    });

    // Supprimer les mots-clés du texte
    keywordPairs.forEach(({ keyword }) => {
        const keywordRegex = new RegExp(keyword, "g");
        replacedText = replacedText.replace(keywordRegex, "");
    });

    // Diviser le texte en utilisant les mots-clés
    return replacedText.replace(/  /g, " ").split("<>");
};

export const getImageDimensions = (imageRef: string) => {
    const [width, height] = imageRef
        ?.split("-")
        .at(-2)
        ?.split("x")
        .map((str) => parseInt(str)) || [0, 0];
    return { width, height };
};

export const listToString = (liste: string[]) => {
    let string = liste.join(", ");
    const index = string.lastIndexOf(",");
    string = index !== -1 ? string.substring(0, index) + " et" + string.substring(index + 1) : string;
    return string;
};

export function extractAndParseJson(text: string): object | null {
    const startIndex = text.indexOf("[");
    const endIndex = text.indexOf("]");

    // Vérification si les crochets ont été trouvés
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const jsonStr = text.slice(startIndex, endIndex + 1); // +1 pour inclure le dernier crochet
        try {
            const jsonObj = JSON.parse(jsonStr);
            return jsonObj as any[];
        } catch (e) {
            console.error("Erreur de parsing JSON:", e);
        }
    }
    return null;
}

export function removeTrailingPunctuation(str: string) {
    return str.replace(/[.,!?]+$/, "");
}

export function splitSentence(sentence: string) {
    // Divise la phrase en prenant en compte les mots avec tiret ou apostrophe
    return sentence.trim().split(/(?<!\w-)\s+|(?<!\w')\s+/);
}

export const safeInputAnswer = (str: string) => {
    return removeTrailingPunctuation(str.trim().toLowerCase()).trim();
};
