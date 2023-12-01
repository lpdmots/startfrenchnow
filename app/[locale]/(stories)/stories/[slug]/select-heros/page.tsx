import { DesktopLayoutSelect } from "@/app/components/stories/selectHero/DesktopLayoutSelect";
import { MobileLayoutSelect } from "@/app/components/stories/selectHero/MobileLayoutSelect";
import { NavBarStorySelect } from "@/app/components/stories/selectHero/NavBarStorySelect";
import { IsDesktop, IsTablet } from "@/app/components/stories/WithMediaQuery";
import { Slug } from "@/app/types/sfn/blog";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { ProtectedPage } from "@/app/components/auth/ProtectedPage";
import { groqQueries } from "@/app/lib/groqQueries";

type Props = {
    params: {
        slug: string;
    };
};

export const revalidate = 60;

/* export async function generateStaticParams() {
    const query = groq`*[_type=='adventure' && isReady && dateTime(publishedAt) < dateTime(now())]
    {
        slug
    }`;

    const slugs: { slug: Slug }[] = await client.fetch(query);
    const slugRoutes = slugs.map((slug) => slug.slug.current);

    return slugRoutes.map((slug) => ({ slug }));
} */

async function StartStory({ params: { slug } }: Props) {
    const story = await client.fetch(groqQueries["adventure"], { slug });
    const element = await client.fetch(groqQueries["element"], { componentId: story.firstChapter?._ref || "" });

    if (!story || !element) return <p>Désolé, cette histoire n'est pas encore disponible.</p>;

    return (
        <ProtectedPage callbackUrl={`/stories/${story.slug.current}/select-heros`} messageInfo="storyAccount">
            <div className="container-default mx-auto h-screen flex flex-col item-center">
                <NavBarStorySelect story={story} />
                <IsDesktop>
                    <DesktopLayoutSelect story={story} element={element} />
                </IsDesktop>
                <IsTablet>
                    <div className="flex grow justify-center items-center">
                        <MobileLayoutSelect story={story} element={element} />
                    </div>
                </IsTablet>
            </div>
        </ProtectedPage>
    );
}

export default StartStory;
