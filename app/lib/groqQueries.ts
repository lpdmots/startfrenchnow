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

const MOCK_EXAM_COMPILATION_FIELDS = `
  _id,
  name,
  isActive,
  order,
  image,
  corrections[]{
    _key,
    correctionType,
    video,
    image,
    body
  },
  _createdAt,
  _updatedAt,
  examConfig
`;

export const MOCK_EXAM_USER_COMPILATIONS_QUERY = groq`
  *[_type == "examCompilation" && isActive == true && _id in $compilationIds]
    | order(coalesce(order, 0) asc, _updatedAt desc) {
      ${MOCK_EXAM_COMPILATION_FIELDS}
    }
`;

export const MOCK_EXAM_COMPILATION_QUERY = groq`
  *[_type == "examCompilation" && _id == $compilationId][0]{
    ${MOCK_EXAM_COMPILATION_FIELDS}
  }
`;

export const MOCK_EXAM_SESSIONS_BY_COMPILATION_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    userRef._ref == $userId &&
    compilationRef._ref == $compilationId
  ] | order(startedAt desc){
    _id,
    status,
    startedAt,
    resume{ state, taskId, activityKey, updatedAt },
    oralBranch,
    writtenCombo,
    speakA2Answers[]{
      taskRef,
      taskId,
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore
    },
    scores{
      speakA2{ percentage, feedback },
      speakBranch{ percentage, feedback },
      listening{ percentage, feedback },
      readWrite{ percentage, feedback },
      total{ percentage, feedback }
    }
  }
`;

export const MOCK_EXAM_TASKS_BY_IDS_QUERY = groq`
  *[_type == "mockExamTask" && _id in $taskIds]{
    _id,
    title,
    taskType,
    supportPdfUrl,
    activities[]{
      _key,
      title,
      image,
      audioUrl,
      promptText,
      aiContext,
      aiCorrectionContext,
      aiVoiceGender,
      items[]{
        _key,
        itemType,
        contentText,
        question,
        image,
        imageAlternativeText,
        answerOptions,
        aiCorrectionContext,
        maxPoints
      }
    }
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
