import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { logoutUser } from "./auth.slice";

export const getAllMachines = createAsyncThunk(
    'api/machine/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_PATHS.MACHINE.GET_ALL);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch machines");
        }
    }
);

export const addMachine = createAsyncThunk(
    'api/machine/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.MACHINE.ADD, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to add machine");
        }
    }
);

export const updateMachine = createAsyncThunk(
    'api/machine/update',
    async ({ data, id }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(API_PATHS.MACHINE.UPDATE(id), data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to update machine");
        }
    }
);

export const deleteMachine = createAsyncThunk(
    'api/machine/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(API_PATHS.MACHINE.DELETE(id));
            return { id: id, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to delete machine");
        }
    }
);

const machineSlice = createSlice({
    name: 'machine',
    initialState: {
        allMachines: null,
        fetchingMachines: true,
        savingMachine: false,
        deletingMachine: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllMachines.pending, (state) => {
                state.fetchingMachines = true;
                state.error = null;
            })
            .addCase(getAllMachines.fulfilled, (state, action) => {
                state.fetchingMachines = false;
                state.allMachines = action.payload.machines || action.payload;
            })
            .addCase(getAllMachines.rejected, (state, action) => {
                state.fetchingMachines = false;
                state.error = action.payload;
            })
            .addCase(addMachine.pending, (state) => {
                state.savingMachine = true;
                state.error = null;
            })
            .addCase(addMachine.fulfilled, (state, action) => {
                state.savingMachine = false;
                const newMachine = action.payload.machine || action.payload;
                state.allMachines = state.allMachines ? [newMachine, ...state.allMachines] : [newMachine];
            })
            .addCase(addMachine.rejected, (state, action) => {
                state.savingMachine = false;
            })
            .addCase(updateMachine.pending, (state) => {
                state.savingMachine = true;
            })
            .addCase(updateMachine.fulfilled, (state, action) => {
                state.savingMachine = false;
                const updatedMachine = action.payload.machine || action.payload;
                if (state.allMachines) {
                    const index = state.allMachines.findIndex((machine) => machine._id === updatedMachine._id);
                    if (index !== -1) {
                        state.allMachines[index] = updatedMachine;
                    }
                }
            })
            .addCase(updateMachine.rejected, (state, action) => {
                state.savingMachine = false;
            })
            .addCase(deleteMachine.pending, (state) => {
                state.deletingMachine = true;
            })
            .addCase(deleteMachine.fulfilled, (state, action) => {
                state.deletingMachine = false;
                if (state.allMachines) {
                    const index = state.allMachines.findIndex((machine) => machine._id === action.payload.id);
                    if (index !== -1) {
                        state.allMachines = state.allMachines.filter((machine) => machine._id !== action.payload.id);
                    }
                }
            })
            .addCase(deleteMachine.rejected, (state, action) => {
                state.deletingMachine = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.allMachines = null;
            });
    }
});

export default machineSlice.reducer;
