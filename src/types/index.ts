export interface Message {
    id: string;
    originalText: string;
    translations: Translations;
    sourceLanguage: string;
    senderId: string;
};

export interface Participant {
    id: string;
    name: string;
    lang: string;
};

export interface Translations extends Record<string, string> {};