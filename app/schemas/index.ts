// Start French now
import blockContent from "./sfn/blockContent";
import post from "./sfn/post";
import user from "./sfn/user";
import video from "./sfn/video";
import videoBlog from "./sfn/videoBlog";
import vocabulary from "./sfn/vocabulary";

// Blog Tools
import flashcards from "./sfn/blogTools/flashcards";
import simpleExercise from "./sfn/blogTools/simpleExercise";
import tabelVoc from "./sfn/blogTools/tabelVoc";

// Exercices
import exerciseTheme from "./sfn/exercises/exerciseTheme";
import simpleQuestion from "./sfn/exercises/simpleQuestion";

// Stories
import adventure from "./stories/adventure";
import effect from "./stories/effect";
import variable from "./stories/variable";
import storyContent from "./stories/storyContent";
import element from "./stories/element";
import extract from "./stories/extract";
import validation from "./stories/validation";
import condition from "./stories/condition";
import modifier from "./stories/modifier";
import choice from "./stories/choice";
import success from "./stories/success";
import feedback from "./stories/feedback";

export const schemaTypes = [
    user,
    post,
    blockContent,
    video,
    videoBlog,
    tabelVoc,
    flashcards,
    simpleExercise,
    exerciseTheme,
    simpleQuestion,
    vocabulary,
    adventure,
    effect,
    variable,
    storyContent,
    element,
    validation,
    extract,
    choice,
    condition,
    modifier,
    success,
    feedback,
];
