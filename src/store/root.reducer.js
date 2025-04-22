import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/auth.slice';

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer; 