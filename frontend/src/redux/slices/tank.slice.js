import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { logoutUser } from "./auth.slice";

export const getAllTanks = createAsyncThunk(
    'api/tank/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_PATHS.TANK.GET_ALL);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch tanks");
        }
    }
);

export const addTank = createAsyncThunk(
    'api/tank/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.TANK.ADD, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to add tank");
        }
    }
);

export const updateTank = createAsyncThunk(
    'api/tank/update',
    async ({ data, id }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(API_PATHS.TANK.UPDATE(id), data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to update tank");
        }
    }
);

export const deleteTank = createAsyncThunk(
    'api/tank/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(API_PATHS.TANK.DELETE(id));
            return { id: id, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to delete tank");
        }
    }
);

const tankSlice = createSlice({
    name: 'tank',
    initialState: {
        allTanks: null,
        fetchingTanks: true,
        savingTank: false,
        deletingTank: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllTanks.pending, (state) => {
                state.fetchingTanks = true;
                state.error = null;
            })
            .addCase(getAllTanks.fulfilled, (state, action) => {
                state.fetchingTanks = false;
                state.allTanks = action.payload.tanks || action.payload;
            })
            .addCase(getAllTanks.rejected, (state, action) => {
                state.fetchingTanks = false;
                state.error = action.payload;
            })
            .addCase(addTank.pending, (state) => {
                state.savingTank = true;
                state.error = null;
            })
            .addCase(addTank.fulfilled, (state, action) => {
                state.savingTank = false;
                const newTank = action.payload.newTank || action.payload.tank || action.payload;
                state.allTanks = state.allTanks ? [newTank, ...state.allTanks] : [newTank];
            })
            .addCase(addTank.rejected, (state, action) => {
                state.savingTank = false;
            })
            .addCase(updateTank.pending, (state) => {
                state.savingTank = true;
            })
            .addCase(updateTank.fulfilled, (state, action) => {
                state.savingTank = false;
                const updatedTank = action.payload.updatedTank || action.payload.tank || action.payload;
                if (state.allTanks) {
                    const index = state.allTanks.findIndex((tank) => tank._id === updatedTank._id);
                    if (index !== -1) {
                        state.allTanks[index] = updatedTank;
                    }
                }
            })
            .addCase(updateTank.rejected, (state, action) => {
                state.savingTank = false;
            })
            .addCase(deleteTank.pending, (state) => {
                state.deletingTank = true;
            })
            .addCase(deleteTank.fulfilled, (state, action) => {
                state.deletingTank = false;
                if (state.allTanks) {
                    state.allTanks = state.allTanks.filter((tank) => tank._id !== action.payload.id);
                }
            })
            .addCase(deleteTank.rejected, (state, action) => {
                state.deletingTank = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.allTanks = null;
            });
    }
});

export default tankSlice.reducer;
