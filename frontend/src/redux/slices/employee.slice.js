import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { logoutUser } from "./auth.slice";

export const getAllEmployees = createAsyncThunk(
    'api/employee/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_PATHS.USER.GET_ALL);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to fetch employees");
        }
    }
);

export const addEmployee = createAsyncThunk(
    'api/employee/add',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_PATHS.USER.ADD, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to add employee");
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'api/employee/update',
    async ({ data, id }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(API_PATHS.USER.UPDATE(id), data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to update employee");
        }
    }
);

export const deleteEmployee = createAsyncThunk(
    'api/employee/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(API_PATHS.USER.DELETE(id));
            return { id: id, message: response.data?.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data || "Unable to delete employee");
        }
    }
);

const employeeSlice = createSlice({
    name: 'employee',
    initialState: {
        allEmployees: null,
        fetchingEmployees: true,
        savingEmployee: false,
        deletingEmployee: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllEmployees.pending, (state) => {
                state.fetchingEmployees = true;
                state.error = null;
            })
            .addCase(getAllEmployees.fulfilled, (state, action) => {
                state.fetchingEmployees = false;
                state.allEmployees = action.payload.users || action.payload; // Usually users
            })
            .addCase(getAllEmployees.rejected, (state, action) => {
                state.fetchingEmployees = false;
                state.error = action.payload;
            })
            .addCase(addEmployee.pending, (state) => {
                state.savingEmployee = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state, action) => {
                state.savingEmployee = false;
                const newEmployee = action.payload.user || action.payload;
                if (newEmployee && newEmployee.id && !newEmployee._id) {
                    newEmployee._id = newEmployee.id;
                }
                state.allEmployees = state.allEmployees ? [newEmployee, ...state.allEmployees] : [newEmployee];
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.savingEmployee = false;
            })
            .addCase(updateEmployee.pending, (state) => {
                state.savingEmployee = true;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.savingEmployee = false;
                const updatedEmployee = action.payload.updatedUser || action.payload.user || action.payload;
                if (updatedEmployee && updatedEmployee.id && !updatedEmployee._id) {
                    updatedEmployee._id = updatedEmployee.id;
                }
                if (state.allEmployees) {
                    const index = state.allEmployees.findIndex((emp) => emp._id === updatedEmployee._id);
                    if (index !== -1) {
                        state.allEmployees[index] = updatedEmployee;
                    }
                }
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.savingEmployee = false;
            })
            .addCase(deleteEmployee.pending, (state) => {
                state.deletingEmployee = true;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.deletingEmployee = false;
                if (state.allEmployees) {
                    state.allEmployees = state.allEmployees.filter((emp) => emp._id !== action.payload.id);
                }
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.deletingEmployee = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.allEmployees = null;
            });
    }
});

export default employeeSlice.reducer;
