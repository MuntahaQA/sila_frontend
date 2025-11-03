import { en } from '../locales/en';
import { ar } from '../locales/ar';

const translations = {
  en,
  ar,
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return value || key;
};

export default translations;

