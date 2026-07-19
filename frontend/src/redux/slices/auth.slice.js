import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        API_PATHS.AUTH.LOGIN, credentials
      );
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data || 'Unable to login'
      );
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
  } finally {
    localStorage.removeItem('authToken');
    return null;
  }
});

export const getUserInfo = createAsyncThunk(
  'auth/get-profile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      return data.user || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Unable to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    authenticating: true,
    error: null
  },
  reducers: {
    clearAuthError: (state) => { state.error = null; },
    updateCurrentUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticating = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authenticating = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.authenticating = false;
        state.user = null;
      })
      .addCase(getUserInfo.pending, (state) => {
        state.authenticating = true;
        state.error = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.authenticating = false;
        state.user = action.payload;
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.authenticating = false;
        state.user = null;
      }
      );
  },
});

export const { clearAuthError, updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;
