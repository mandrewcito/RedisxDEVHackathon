import { configureStore } from '@reduxjs/toolkit'
import settingsSlice from './features/settingsSlice'

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer
  }
})