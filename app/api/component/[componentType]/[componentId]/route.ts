import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { NextRequest, NextResponse } from "next/server";

export const groqQueries: any = {
    adventure: groq`*[_type=='adventure' && slug.current == $slug][0]{
        ...,
        variables[]->,
        heros[] {
            ...,
            variables[]->,
        },
    }`,
    element: groq`*[_type=='element' && _id == $componentId ][0]{ 
        ...,
        validation->,
        extracts[]-> {
            ...,
            validation->,
        },
        effects[]-> {
            ...,
            validation->,
        },
        choices[]->{
            ...,
            element->{
                _id,
                nature,
                name,
                label,
                code,
                validation->,
                antagonistes,
                duration,
            },
            validation->,  
            extracts[]-> {
                ...,
                validation->,
            },  
            effects[]-> {
                ...,
                validation->,
            },    
        },
    }`,
    variable: groq`*[_type=='variable' && _id == $componentId ][0]{
        ...,
        display {
            ...,
            validation->,
        },
        onMountEffects[]-> {
            ...,
            validation->,
        },
        unMountEffects[]-> {
            ...,
            validation->,
        },
    }`,
    choice: groq`*[_type=='choice' && _id == $componentId ][0]{
        ...,
        element->{
            _id,
            nature,
            name,
            label,
            code,
            validation->,
            antagonistes,
            duration,
        },
        validation->,
        extracts[]-> {
            ...,
            validation->,
        },  
        effects[]-> {
            ...,
            validation->,
        }, 
    }`,
    extract: groq`*[_type=='extract' && _id == $componentId ][0]{
        ...,
        validation->,
    }`,
    effect: groq`*[_type=='effect' && _id == $componentId ][0]{
        ...,
        validation->,
    }`,
};

export async function GET(_: NextRequest, { params }: { params: { componentType: string; componentId: string } }) {
    const { componentType, componentId } = params;
    const groqQuery = groqQueries[componentType];

    try {
        const component = await client.fetch(groqQuery, { componentId });
        return NextResponse.json(component, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
