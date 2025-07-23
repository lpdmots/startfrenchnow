// Start French now
import blockContent from "./sfn/blockContent";
import post from "./sfn/post";
import user from "./sfn/user";
import product from "./sfn/product";
import video from "./sfn/video";
import videoBlog from "./sfn/blogTools/videoBlog";
import theme from "./sfn/blogTools/theme";
import fideExam from "./sfn/fideExam";

// Blog Tools
import flashcards from "./sfn/blogTools/flashcards";
import exercise from "./sfn/exercises/exercise";
import tabelVoc from "./sfn/blogTools/tabelVoc";
import vocabItem from "./sfn/blogTools/vocabItem";

// Exercices
import question from "./sfn/exercises/question";

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
    product,
    blockContent,
    video,
    fideExam,
    videoBlog,
    tabelVoc,
    vocabItem,
    flashcards,
    exercise,
    question,
    theme,
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
