import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'en' | 'hi' | 'mr';

interface UIState {
  lang: Language;
}

const initialState: UIState = {
  lang: (localStorage.getItem('ug_admin_lang') as Language) || 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.lang = action.payload;
      localStorage.setItem('ug_admin_lang', action.payload);
    },
  },
});

export const { setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
