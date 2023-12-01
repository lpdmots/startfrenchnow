export interface DataTypes {
    theme: string;
    vocabulary: string;
}

export interface VocabularyDataTypes {
    theme: string;
    lines: { french: string; english: string; note: string; nature: string; sound: string; _key: string }[];
    _type: "vocabulary";
}

export interface FindVocabularyDataTypes {
    title: string;
    vocabulary: string;
}
