import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import tankReducer from './slices/tank.slice';
import machineReducer from './slices/machine.slice';
import employeeReducer from './slices/employee.slice';
import shiftReducer from './slices/shift.slice';
import fuelPriceReducer from './slices/fuelPrice.slice';
import refillReducer from './slices/refill.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tank: tankReducer,
    machine: machineReducer,
    employee: employeeReducer,
    shift: shiftReducer,
    fuelPrice: fuelPriceReducer,
    refill: refillReducer,
  },
});
