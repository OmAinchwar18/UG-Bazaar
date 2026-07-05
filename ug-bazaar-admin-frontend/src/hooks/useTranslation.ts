import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setLanguage, Language } from '../store/slices/uiSlice';
import { dict } from '@ugbazaar/shared';

export function useTranslation() {
  const dispatch = useDispatch();
  const lang = useSelector((state: RootState) => state.ui.lang);

  const changeLanguage = (newLang: Language) => {
    dispatch(setLanguage(newLang));
  };

  const currentDict = dict[lang] || dict.en;

  return {
    lang,
    changeLanguage,
    currentDict,
  };
}
