import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { logoutUser } from "./auth.slice";

export const getFuelPriceHistory = createAsyncThunk(
    'api/fuelPrice/getHistory',
    async (fuelType = "", { rejectWithValue }) => {
        try {
            const url = fuelType ? `${API_PATHS.FUEL_PRICE.HISTORY}?fuelType=${fuelType}` : API_PATHS.FUEL_PRICE.HISTORY;
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch fuel price history");
        }
    }
);

export const getCurrentFuelPrices = createAsyncThunk(
    'api/fuelPrice/getCurrent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_PATHS.FUEL_PRICE.CURRENT);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch current fuel prices");
        }
    }
);

export const addFuelPrice = createAsyncThunk(
    'api/fuelPrice/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.FUEL_PRICE.ADD, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to add fuel price");
        }
    }
);

const fuelPriceSlice = createSlice({
    name: 'fuelPrice',
    initialState: {
        history: null,
        current: null,
        fetchingHistory: true,
        fetchingCurrent: true,
        savingPrice: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getFuelPriceHistory.pending, (state) => {
                state.fetchingHistory = true;
                state.error = null;
            })
            .addCase(getFuelPriceHistory.fulfilled, (state, action) => {
                state.fetchingHistory = false;
                state.history = action.payload.priceHistory || action.payload;
            })
            .addCase(getFuelPriceHistory.rejected, (state, action) => {
                state.fetchingHistory = false;
                state.error = action.payload;
            })
            .addCase(getCurrentFuelPrices.pending, (state) => {
                state.fetchingCurrent = true;
                state.error = null;
            })
            .addCase(getCurrentFuelPrices.fulfilled, (state, action) => {
                state.fetchingCurrent = false;
                state.current = action.payload;
            })
            .addCase(getCurrentFuelPrices.rejected, (state, action) => {
                state.fetchingCurrent = false;
                state.error = action.payload;
            })
            .addCase(addFuelPrice.pending, (state) => {
                state.savingPrice = true;
                state.error = null;
            })
            .addCase(addFuelPrice.fulfilled, (state, action) => {
                state.savingPrice = false;
                const newPrice = action.payload.fuelPrice || action.payload.price || action.payload;
                state.history = state.history ? [newPrice, ...state.history] : [newPrice];
                // Also optimistically update current if applicable
                if (state.current) {
                    state.current[newPrice.fuelType] = newPrice;
                }
            })
            .addCase(addFuelPrice.rejected, (state, action) => {
                state.savingPrice = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.history = null;
                state.current = null;
            });
    }
});

export default fuelPriceSlice.reducer;
