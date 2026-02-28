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

export const FRENCH_USER_PROGRESS_QUERY = groq`
  *[_type == "user" && _id == $userId][0].learningProgress[type == $courseKey][0]{
    _key,
    type,
    videoLogs
  }
`;

const MOCK_EXAM_SESSION_FIELDS = `
  session[]{
    _key,
    status,
    startedAt,
    resume{ state, taskId, activityKey, updatedAt },
    scores{
      speakA2{ score, max },
      speakBranch{ score, max },
      listening{ score, max },
      readWrite{ score, max },
      total{ score, max }
    }
  }
`;

export const MOCK_EXAM_USER_COMPILATIONS_QUERY = groq`
  *[_type == "examCompilation" && userId == $userId]
    | order(_updatedAt desc) {
      _id,
      image,
      _createdAt,
      _updatedAt,
      oralBranch,
      writtenCombo,
      ${MOCK_EXAM_SESSION_FIELDS}
    }
`;

export const MOCK_EXAM_COMPILATION_QUERY = groq`
  *[_type == "examCompilation" && _id == $compilationId][0]{
    _id,
    image,
    _createdAt,
    _updatedAt,
    userId,
    examConfig,
    oralBranch,
    writtenCombo,
    ${MOCK_EXAM_SESSION_FIELDS}
  }
`;

export const MOCK_EXAM_TASKS_BY_TYPE_QUERY = groq`
  *[_type == "mockExamTask" && taskType in $types]
    | order(_updatedAt desc, _createdAt desc) {
      _id,
      taskType,
      "firstActivityImage": activities[0].image
    }
`;

export const MOCK_EXAM_LISTENING_PACKS_BY_LEVEL_QUERY = groq`
  *[_type == "fideExam" && competence == "Comprendre" && $level in levels]
    | order(order asc, _createdAt desc) {
      _id
    }
`;

export const USER_MOCK_EXAM_CREDITS_QUERY = groq`
  *[_type == "user" && _id == $userId][0]
    .credits[referenceKey == "mock_exam"][0]{
      _key,
      referenceKey,
      totalCredits,
      remainingCredits
    }
`;
