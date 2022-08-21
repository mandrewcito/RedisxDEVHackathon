import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    coin: "USD"
  },
  reducers: {
    changeCoin(state, action) {
        state.coin = action.payload.coin
        }
    }
})

export default settingsSlice;