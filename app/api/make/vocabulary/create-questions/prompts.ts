import { Format } from "./types";
export const QUESTIONSPEREXERCISE = 3;

export const BUTTONSTRUCTURE = `[{    
    "exerciseTypes": ["buttons"],    
    "prompt": {        
        "text": "Écris la question ici."
    }, 
    "responses": [        
        {            
            "text": "Écris la réponse ici.",            
            "isCorrect": null  // Mettre 1 si la réponse est correcte, sinon laisser null.
        },
        // ... Les autres réponses.    
    ]    
},
// ... LES AUTRES QUESTIONS.
]`;

export const TRUEFALSESTRUCTURE = `[{    
    "exerciseTypes": ["true-false"],    
    "prompt": {        
        "text": "Écris la question ici."
    }, 
    "responses": [        
        {            
            "text": "Vrai",            
            "isCorrect": "1"
        },
        {            
            "text": "Faux", 
            "isCorrect": null
        }  
    ]    
},
// ... LES AUTRES QUESTIONS.
]`;

export const CHECKBOXSTRUCTURE = `[{
    "exerciseTypes": ["checkbox"],
    "prompt": {
        "text": "Écris la question ici."
    },
    "responses": [
        {
            "text": "Écris la réponse ici.",
            "isCorrect": Mettre "1" si la réponse est correcte, sinon laisser null.
        },
        // ... Les autres réponses.
    ]
},`;

export const SELECTSTRUCTURE = `[{
    "exerciseTypes": ["select"],
    "prompt": {
        "text": "Écris la question ici."
    },
    "responses": [
        {
            "text": "Écris la réponse ici.",
            "isCorrect": Mettre "1" si la réponse est correcte, sinon laisser null.
        },
        // ... Les autres réponses.
    ]
},`;

export const LINKTRUCTURE = `[{
    "exerciseTypes": ["link"],
    "prompt": {
        "text": "Retrouve les paires (find the pairs)."
    },
    "responses": [
        {
            "text": "pair 1",
            "isCorrect": "{"column": "left", "value": 1}" // il s'agit d'un objet json stringifié
        },
        {
            "text": "pair 1",
            "isCorrect": "{"column": "right", "value": 1}" // il s'agit d'un objet json stringifié
        },
        {
            "text": "pair 2",
            "isCorrect": "{"column": "left", "value": 2}" // il s'agit d'un objet json stringifié
        },
        {
            "text": "pair 2",
            "isCorrect": "{"column": "right", "value": 2}" // il s'agit d'un objet json stringifié
        },
        // ... Les autres paires.
    ]
},`;

const FORMAT: Format = {
    buttons: BUTTONSTRUCTURE,
    "true-false": TRUEFALSESTRUCTURE,
    checkbox: CHECKBOXSTRUCTURE,
    select: SELECTSTRUCTURE,
    link: LINKTRUCTURE,
};

export const SYSTEMCONTENT = "Tu es un développeur web expérimenté chargé de créer des quiz et exercices en ligne.";
export const SYSTEMQUESTIONSONLY = "Tu es diplômé en français Langue Étrangère et détenteur d'un diplôme d'enseignement.";

export const userPrompt = (theme: string, words: string, exerciseType: keyof Format) => {
    switch (exerciseType) {
        case "buttons":
            return buttonsPrompt(theme, words);
        case "true-false":
            return trueFalsePrompt(theme, words);
        case "checkbox":
            return checkboxPrompt(theme, words);
        case "select":
            return selectPrompt(theme, words);
        case "link":
            return linkPrompt(theme, words);
        default:
            return "";
    }
};

export const userPromptQuestionsJson = (theme: string, exerciseType: keyof Format, questionsOnly: string) => {
    const format = JSON.stringify(FORMAT[exerciseType]);
    return `Voici des questions sur le thème: ${theme} : ${questionsOnly}. Remplit UN SEUL JSON qui liste toutes les questions proposées en suivant ce format précis: ${format}.`;
};

export const buttonsPrompt = (theme: string, words: string) => {
    return `Crée une liste de ${QUESTIONSPEREXERCISE.toString()} questions/réponses pertinentes sur le thème ${theme}, intégrant les mots : ${words}. Tes questions/réponses doivent impérativement respecter les points suivants:
    - elles s'accompagnent de 4 réponses parmi lesquelles une seule est valide.
    - Elles font appel aux connaissances sur le thème ${theme} et aux mots appris.
    - Les questions sont en anglais sauf si elles font appel à des connaissances acquises dans le cours.
    - Elles sont brèves et claires.
    - Elles visent à tester les connaissances en français et non en anglais.`;
};

export const trueFalsePrompt = (theme: string, words: string) => {
    return `Crée une liste de ${QUESTIONSPEREXERCISE.toString()} questions/réponses pertinentes sur le thème ${theme}, intégrant les mots : ${words}. Tes questions/réponses doivent impérativement respecter les points suivants:
    - elles est de type vrai/faux, teste la connaissance des mots appris et est parfois vraie, parfois fausse.
    - Elles font appel aux connaissances sur le thème ${theme} et aux mots appris.
    - Les questions sont en anglais sauf si elles font appel à des connaissances acquises dans le cours.
    - Elles sont brèves et claires.
    - Elles visent à tester les connaissances en français et non en anglais.`;
};

export const checkboxPrompt = (theme: string, words: string) => {
    return `Crée une liste de ${QUESTIONSPEREXERCISE.toString()} questions/réponses pertinentes sur le thème ${theme}, intégrant les mots : ${words}. Tes questions/réponses doivent impérativement respecter les points suivants:
    - elles s'accompagnent de 4 réponses parmi lesquelles plusieurs peuvent être valides.
    - Elles font appel aux connaissances sur le thème ${theme} et aux mots appris.
    - Les questions sont en anglais sauf si elles font appel à des connaissances acquises dans le cours.
    - Elles sont brèves et claires.
    - Elles visent à tester les connaissances en français et non en anglais.`;
};

export const selectPrompt = (theme: string, words: string) => {
    return `Crée une liste de ${QUESTIONSPEREXERCISE.toString()} questions/réponses pertinentes sur le thème ${theme}, intégrant les mots : ${words}. Tes questions/réponses doivent impérativement respecter les points suivants:
    - La réponse est apportée par l'utilisateur dans une liste déroulante située dans la phrase question et signalée par le mot RESPONSE. Par exemple: Je coupe avec un RESPONSE.
    - Elles font appel aux connaissances sur le thème ${theme} et aux mots appris.
    - Les questions sont en anglais sauf si elles font appel à des connaissances acquises dans le cours.
    - Elles sont brèves et claires.
    - Elles visent à tester les connaissances en français et non en anglais.`;
};

export const linkPrompt = (theme: string, words: string) => {
    return `Crée une liste de ${QUESTIONSPEREXERCISE.toString()} exercices sur le thème ${theme}, intégrant les mots : ${words}. Il s'agit d'exercices où il s'agit de retrouver des paires de mots. Chaque exercice doit impérativement respecter les points suivants:
    - Les paires fonctionnent soit par mot français / mot anglais, ou une question apprise en français / une réponse qui peut correspondre.
    - Elles font appel aux connaissances sur le thème ${theme} et aux mots appris.
    - Les paires sont constituées de mots uniquement ou de courtes formulations apprises.
    - Exemple d'exercice: 
        consigne: "Retrouve les paires (find the pairs)."
        paires: "pair 1" - "pair 1", "pair 2" - "pair 2"...
    `;
};
