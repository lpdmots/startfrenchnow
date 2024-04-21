"use server";

const UDEMY_API_KEY = process.env.UDEMY_API_KEY;

export const getCourseDetails = async (courseId: string) => {
    try {
        const response = await fetch(`https://www.udemy.com/api-2.0/courses/${courseId}/?fields[course]=num_subscribers,num_reviews,avg_rating`, {
            method: "GET",
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
        //console.log(data);
        return data;
    } catch (error: any) {
        return { message: error.message };
    }
};

export const getLastComments = async (courseId: string, page: number) => {
    try {
        const response = await fetch(`https://www.udemy.com/api-2.0/courses/${courseId}/reviews/?page=${page.toString()}&page_size=50&fields[results]=content,rating,user,created`, {
            method: "GET",
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
        console.log(data);
        return data.results;
    } catch (error: any) {
        return { message: error.message };
    }
};
