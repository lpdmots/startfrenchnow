import { groq } from "next-sanity";

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
        reviews[] {
            ...,
            success[]-> {
                ...,
                validation->,
            },
        }
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
    success: groq`*[_type=='success' && _id == $componentId ][0]{
        ...,
        validation->,
    }`,
    vocabulary: groq`*[_type=='vocabulary' && _id == $componentId ][0]{
        ...,
    }`,
    feedback: groq`*[_type=='feedback' ][0]{
        ...,
    }`,
};
