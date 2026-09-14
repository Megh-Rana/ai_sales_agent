import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';
import { mr } from './mr';

export const translations = {
  en,
  hi,
  gu,
  mr,
};

export type Language = keyof typeof translations;

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];
