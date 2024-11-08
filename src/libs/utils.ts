import { languages } from "@/config/languages";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
} 

export const filterLanguages = (languageCodes: string[]) => {
    return Object.fromEntries(
      Object.entries(languages).filter(([, value]) => languageCodes.includes(value))
    );
  };