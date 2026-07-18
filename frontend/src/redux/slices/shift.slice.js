import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { logoutUser } from "./auth.slice";

export const getAllShifts = createAsyncThunk(
    'api/shift/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_PATHS.SHIFT.GET_ALL);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch shifts");
        }
    }
);

export const startShift = createAsyncThunk(
    'api/shift/start',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.SHIFT.START, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to start shift");
        }
    }
);

export const endShift = createAsyncThunk(
    'api/shift/end',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.SHIFT.END(id), data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to end shift");
        }
    }
);

const shiftSlice = createSlice({
    name: 'shift',
    initialState: {
        allShifts: null,
        fetchingShifts: true,
        savingShift: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllShifts.pending, (state) => {
                state.fetchingShifts = true;
                state.error = null;
            })
            .addCase(getAllShifts.fulfilled, (state, action) => {
                state.fetchingShifts = false;
                state.allShifts = action.payload.shifts || action.payload;
            })
            .addCase(getAllShifts.rejected, (state, action) => {
                state.fetchingShifts = false;
                state.error = action.payload;
            })
            .addCase(startShift.pending, (state) => {
                state.savingShift = true;
                state.error = null;
            })
            .addCase(startShift.fulfilled, (state, action) => {
                state.savingShift = false;
                const newShift = action.payload.shift || action.payload;
                state.allShifts = state.allShifts ? [newShift, ...state.allShifts] : [newShift];
            })
            .addCase(startShift.rejected, (state, action) => {
                state.savingShift = false;
                state.error = action.payload;
            })
            .addCase(endShift.pending, (state) => {
                state.savingShift = true;
                state.error = null;
            })
            .addCase(endShift.fulfilled, (state, action) => {
                state.savingShift = false;
                const updatedShift = action.payload.shift || action.payload;
                if (state.allShifts) {
                    const index = state.allShifts.findIndex((shift) => shift._id === updatedShift._id);
                    if (index !== -1) {
                        state.allShifts[index] = updatedShift;
                    }
                }
            })
            .addCase(endShift.rejected, (state, action) => {
                state.savingShift = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.allShifts = null;
            });
    }
});

export default shiftSlice.reducer;
