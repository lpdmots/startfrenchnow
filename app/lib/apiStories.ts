import ky from "ky";

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const maxAge = 15 * 60 * 1000; // Cache pour 15 minutes
const cache = new Map<string, CacheEntry<any>>();

async function fetchData<T>(componentType: string, id: string): Promise<T> {
    const url = `/api/component/${componentType}/${id}`;
    const currentTimestamp = Date.now();
    const cachedEntry = cache.get(url);

    if (cachedEntry && currentTimestamp - cachedEntry.timestamp < maxAge) {
        return structuredClone(cachedEntry.data);
    }

    const response: T = await ky.get(url).json();
    cache.set(url, { data: response, timestamp: currentTimestamp });

    return structuredClone(response);
}

export default fetchData;

export async function addGameStarted(data: { storyId: string; userId: string }) {
    fetch("/api/stories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to add new game counter");
        return res.json();
    });
}
