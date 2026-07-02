import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@ugbazaar/shared';
export type { User };

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const getStoredUser = (): User | null => {
  try {
    const u = localStorage.getItem('ug_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('ug_token'),
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('ug_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('ug_token', action.payload.token);
      localStorage.setItem('ug_user', JSON.stringify(action.payload.user));
      localStorage.setItem('ug_user_role', action.payload.user.role);
      localStorage.setItem('ug_user_name', action.payload.user.name);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ug_token');
      localStorage.removeItem('ug_user');
      localStorage.removeItem('ug_user_role');
      localStorage.removeItem('ug_user_name');
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('ug_user', JSON.stringify(state.user));
        localStorage.setItem('ug_user_name', state.user.name);
      }
    }
  }
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
