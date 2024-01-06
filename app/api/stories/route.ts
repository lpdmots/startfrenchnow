import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { UserProps, UserScore, UserStory } from "@/app/types/sfn/auth";
import { Adventure, StoryStats } from "@/app/types/stories/adventure";
import { NextRequest, NextResponse } from "next/server";

const INITIALSTORYSTATS = {
    gamesStarted: 0,
    games: 0,
    userIds: [],
    scores: [],
    success: [],
    averageSuccess: [],
};

const getInitialData = (storyId: string) => {
    return {
        story: {
            _ref: storyId,
            _type: "adventure",
        },
        lastGameDate: 0,
        feedback: "open" as "open" | "no" | "done",
        gamesStarted: 0,
        games: 0,
        scores: [] as UserScore[],
        success: [] as string[],
    };
};

export async function POST(request: NextRequest) {
    const data = await request.json();
    const { userId, storyId } = data;

    const user: UserProps = await client.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
    const story: Adventure = await client.fetch(`*[_type == "adventure" && _id == $storyId][0]`, { storyId });

    if (!user || !story || !userId) return NextResponse.json({ message: "No user or no story found." }, { status: 400 });
    if (user.isAdmin) return NextResponse.json({ message: "Admin accounts do not count" }, { status: 200 });

    // Story Stats
    const storyPreviousData = structuredClone(story.stats);
    const storyStats: StoryStats = storyPreviousData || INITIALSTORYSTATS;
    storyStats.gamesStarted = storyStats.gamesStarted ? storyStats.gamesStarted + 1 : 1;

    // User Stats
    const userPreviousData = structuredClone(user.stories?.find((story) => story.story._ref === storyId));
    const userStoryData: UserStory = userPreviousData || getInitialData(storyId);
    userStoryData.gamesStarted = userStoryData.gamesStarted ? userStoryData.gamesStarted + 1 : 1;

    try {
        client.patch(storyId).set({ stats: storyStats }).commit({ autoGenerateArrayKeys: true });

        const valueToUnset = userPreviousData ? [`stories[story._ref == "${storyId}"]`] : [];
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

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
