import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  lang: 'en' | 'hi' | 'mr';
  isCartOpen: boolean;
  recentlyViewed: string[];
  comparisonList: string[];
}

const getStoredRecentlyViewed = (): string[] => {
  try {
    const list = localStorage.getItem('ug_recently_viewed');
    return list ? JSON.parse(list) : [];
  } catch {
    return [];
  }
};

const initialState: UIState = {
  lang: (localStorage.getItem('ug_lang') as 'en' | 'hi' | 'mr') || 'en',
  isCartOpen: false,
  recentlyViewed: getStoredRecentlyViewed(),
  comparisonList: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<'en' | 'hi' | 'mr'>) {
      state.lang = action.payload;
      localStorage.setItem('ug_lang', action.payload);
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    addRecentlyViewed(state, action: PayloadAction<string>) {
      const list = state.recentlyViewed.filter(id => id !== action.payload);
      list.unshift(action.payload);
      state.recentlyViewed = list.slice(0, 10);
      localStorage.setItem('ug_recently_viewed', JSON.stringify(state.recentlyViewed));
    },
    toggleComparison(state, action: PayloadAction<string>) {
      if (state.comparisonList.includes(action.payload)) {
        state.comparisonList = state.comparisonList.filter(id => id !== action.payload);
      } else {
        if (state.comparisonList.length < 4) {
          state.comparisonList.push(action.payload);
        }
      }
    },
    clearComparison(state) {
      state.comparisonList = [];
    }
  }
});

export const { setLanguage, toggleCart, addRecentlyViewed, toggleComparison, clearComparison } = uiSlice.actions;
export default uiSlice.reducer;
