"use server";

const UDEMY_API_KEY = process.env.UDEMY_API_KEY;
const UDEMY_CACHE_SECONDS = 3600;

export const getCourseDetails = async (courseId: string) => {
    try {
        const response = await fetch(`https://www.udemy.com/api-2.0/courses/${courseId}/?fields[course]=num_subscribers,num_reviews,avg_rating`, {
            method: "GET",
            cache: "force-cache",
            next: { revalidate: UDEMY_CACHE_SECONDS, tags: [`udemy:course:${courseId}`] },
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Basic ${UDEMY_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error: any) {
        return { message: error.message };
    }
};

export const getLastComments = async (courseId: string, page: number) => {
    try {
        const response = await fetch(`https://www.udemy.com/api-2.0/courses/${courseId}/reviews/?page=${page.toString()}&page_size=50&fields[results]=content,rating,user,created`, {
            method: "GET",
            cache: "force-cache",
            next: { revalidate: UDEMY_CACHE_SECONDS, tags: [`udemy:course:${courseId}:reviews:${page}`] },
            headers: {
                Accept: "application/json, text/plain, */*",
                Authorization: `Basic ${UDEMY_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.results;
    } catch (error: any) {
        return { message: error.message };
    }
};
