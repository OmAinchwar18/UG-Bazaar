import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { dict } from '@ugbazaar/shared';

export function useTranslation() {
  const lang = useSelector((state: RootState) => state.ui.lang) || 'en';

  const t = (section: keyof typeof dict.en, key: string): string => {
    const s = dict[lang]?.[section] || dict.en[section];
    const val = (s as any)?.[key];
    if (val !== undefined) return val;
    // Fallback to English
    return ((dict.en[section] as any)?.[key]) || key;
  };

  return {
    t,
    lang,
    currentDict: dict[lang] || dict.en
  };
}
