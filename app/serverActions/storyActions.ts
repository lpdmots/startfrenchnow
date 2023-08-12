"use server";

import { Review, ScoreProps } from "../types/stories/element";
import { SanityServerClient as client } from "../lib/sanity.clientServer";
import { UserProps, UserScore, UserStory } from "../types/sfn/auth";
import { Adventure, Feedback, StarRating, StoryStats } from "../types/stories/adventure";
import { CheckBoxes } from "../(user)/(stories)/stories/[slug]/feedback/page";

const getInitialData = (storyId: string) => {
    return {
        story: {
            _ref: storyId,
            _type: "adventure",
        },
        lastGameDate: 0,
        feedback: "open" as "open" | "no" | "done",
        games: 0,
        scores: [] as UserScore[],
        success: [] as string[],
    };
};

const getUserScore = (userStoryData: UserStory, score: ScoreProps) => {
    const userScore = userStoryData.scores.find((userScore) => userScore.title === score.title);
    if (userScore) return userScore;

    const newUserScore = {
        title: score.title,
        bestScore: 0,
        lowestScore: 10000,
    };
    userStoryData.scores.push(newUserScore);
    return newUserScore;
};

export const storyToStats = async (gameDate: number, userId: string, storyId: string, reviews: Review[]) => {
    const user: UserProps = await client.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
    const story: Adventure = await client.fetch(`*[_type == "adventure" && _id == $storyId][0]`, { storyId });
    if (!user) return { error: "User not found", userStoryData: null };
    if (!story) return { error: "Story not found", userStoryData: null };

    const previousData = structuredClone(user.stories?.find((story) => story.story._ref === storyId));
    const userStoryData: UserStory = previousData || getInitialData(storyId);
    if (userStoryData.lastGameDate === gameDate) return { error: "Game already archived", userStoryData: null };
    userStoryData.lastGameDate = gameDate;

    const respToStory = await storyToStoryStats(story, userId, reviews, userStoryData);
    if (respToStory?.error) return respToStory;

    const respToUser = await storyToUserStats(userStoryData, reviews, userId, storyId, !!previousData);
    if (respToUser?.error) return respToUser;
};

export const storyToUserStats = async (userStoryData: UserStory, reviews: Review[], userId: string, storyId: string, isPreviousData: boolean) => {
    userStoryData.games += 1;

    reviews.forEach((review) => {
        const { scores, success } = review;

        scores &&
            scores.forEach((score) => {
                const userScore = getUserScore(userStoryData, score);
                userScore.bestScore = Math.max(userScore.bestScore, score.value || 0);
                userScore.lowestScore = Math.min(userScore.lowestScore, score.value || 10000);
            });

        success &&
            success.forEach((success) => {
                if (!success.unlocked) return;
                if (!userStoryData.success.includes(success._id)) userStoryData.success.push(success._id);
            });
    });

    try {
        const valueToUnset = isPreviousData ? [`stories[story._ref == "${storyId}"]`] : [];
        client
            .patch(userId)
            // Ensure that the `reviews` arrays exists before attempting to add items to it
            .setIfMissing({ stories: [] })
            .unset(valueToUnset)
            // Add the items after the last item in the array (append)
            .insert("after", "stories[-1]", [userStoryData])
            .commit({
                autoGenerateArrayKeys: true,
            });
        return { error: null, userStoryData };
    } catch (error) {
        return { error, userStoryData: null };
    }
};

export const getUserStoryData = async (userId: string, storyId: string) => {
    try {
        const user: UserProps = await client.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
        return { error: null, userStoryData: user?.stories?.find((story) => story.story._ref === storyId) };
    } catch (error) {
        return { error, userStoryData: null };
    }
};

export const setStoryFeedback = async (userId: string, storyId: string, value: "open" | "no" | "done") => {
    const user: UserProps = await client.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
    const userStoryData: UserStory | undefined = user?.stories?.find((story) => story.story._ref === storyId);
    if (!userStoryData) return;
    userStoryData.feedback = value;
    try {
        client
            .patch(userId)
            .setIfMissing({ stories: [] })
            .unset([`stories[story._ref == "${storyId}"]`])
            .insert("after", "stories[-1]", [userStoryData])
            .commit({
                autoGenerateArrayKeys: true,
            });
    } catch (error) {
        console.error(error);
    }
};

const INITIALSTORYSTATS = {
    games: 0,
    userIds: [],
    scores: [],
    success: [],
    averageSuccess: [],
};

export const storyToStoryStats = async (story: Adventure, userId: string, reviews: Review[], userStoryData: UserStory) => {
    const previousData = structuredClone(story.stats);
    const storyStats: StoryStats = previousData || INITIALSTORYSTATS;

    storyStats.games += 1;
    if (!storyStats.userIds.includes(userId)) storyStats.userIds.push(userId);

    reviews.forEach((review) => {
        const { scores, success } = review;

        scores &&
            scores.forEach((score) => {
                const storyScore = storyStats.scores.find((storyScore) => storyScore.title === score.title);
                if (!storyScore) {
                    storyStats.scores.push({
                        title: score.title,
                        averageScore: score.value || 0,
                        bestScore: {
                            value: score.value || 0,
                            userId,
                        },
                        lowestScore: {
                            value: score.value || 0,
                            userId,
                        },
                    });
                } else {
                    storyScore.averageScore += score.value || 0;
                    if ((score.value || 0) > storyScore.bestScore.value) {
                        storyScore.bestScore = {
                            value: score.value || 0,
                            userId: userId,
                        };
                    }
                    if ((score.value || 10000) < storyScore.lowestScore.value) {
                        storyScore.lowestScore = {
                            value: score.value || 10000,
                            userId: userId,
                        };
                    }
                }
            });

        success &&
            success.forEach((success) => {
                const storySuccess = storyStats.success.find((storySuccess) => storySuccess.id === success._id);
                const storyAverageSuccess = storyStats.averageSuccess.find((storyAverageSuccess) => storyAverageSuccess.id === success._id);
                if (success.unlocked && !userStoryData.success.includes(success._id)) {
                    if (!storySuccess) {
                        storyStats.success.push({
                            id: success._id,
                            value: 1,
                        });
                    } else {
                        storySuccess.value += 1;
                    }
                }
                if (success.unlocked) {
                    if (!storyAverageSuccess) {
                        storyStats.averageSuccess.push({
                            id: success._id,
                            value: 1,
                        });
                    } else {
                        storyAverageSuccess.value += 1;
                    }
                }
            });
    });

    try {
        client.patch(story._id).set({ stats: storyStats }).commit({ autoGenerateArrayKeys: true });
        return { error: null, storyStats };
    } catch (error) {
        return { error, userStoryData: null };
    }
};

export const updateFeedback = async (data: any, slug: string, userId: string | undefined) => {
    const oldFeedback: Feedback = await client.fetch(`*[_type == "feedback"][0]`);
    const story = await client.fetch(`*[_type == "adventure" && slug.current == $slug][0]`, { slug });

    if (!oldFeedback || !story || !userId) return { error: "error404", success: false };
    if (oldFeedback.userIds?.includes(userId)) return { error: "allready", success: false };

    const { stars, checkboxes, comment } = data;
    try {
        const newFeedback = structuredClone(oldFeedback);
        if (!newFeedback?.starRating?.length) newFeedback.starRating = [];
        if (!newFeedback?.features?.length) newFeedback.features = [];
        if (!newFeedback?.comment?.length) newFeedback.comment = [];
        if (!newFeedback?.userIds?.length) newFeedback.userIds = [];

        Object.entries(stars as StarRating).forEach(([key, value]) => {
            if (value === -1) return;
            const existingStar = newFeedback.starRating.find((star) => star.title === key);
            if (existingStar) {
                existingStar.totalStars += value + 1;
                existingStar.vote += 1;
            } else {
                newFeedback.starRating.push({
                    title: key,
                    totalStars: value + 1,
                    vote: 1,
                });
            }
        });

        Object.entries(checkboxes as CheckBoxes).forEach(([_, value]) => {
            const existingFeature = newFeedback.features.find((feature) => feature.title === value.title);
            if (existingFeature) {
                existingFeature.totalChecked += value.checked ? 1 : 0;
                existingFeature.vote += 1;
            } else {
                newFeedback.features.push({
                    title: value.title,
                    totalChecked: value.checked ? 1 : 0,
                    vote: 1,
                });
            }
        });

        comment && newFeedback.comment.push({ userId, comment });
        newFeedback.userIds.push(userId);

        await client.patch(oldFeedback._id).set(newFeedback).commit({ autoGenerateArrayKeys: true });

        return { error: null, success: true };
    } catch (error) {
        return { error: "error500", success: false };
    }
};
