export interface Message {
    id: number;
    text: string;
    translated: string;
    fromLang: string;
    toLang: string;
    isUser: boolean;
};