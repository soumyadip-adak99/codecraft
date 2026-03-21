import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserState {
    hasApiKey: boolean;
}

// ── Initial State ──────────────────────────────────────────────────────────────
const initialState: UserState = {
    hasApiKey: false,
};

// ── Slice ──────────────────────────────────────────────────────────────────────
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setHasApiKey(state, action: PayloadAction<boolean>) {
            state.hasApiKey = action.payload;
        },
        reset(state) {
            state.hasApiKey = false;
        },
    },
});

export const { setHasApiKey, reset } = userSlice.actions;

export default userSlice.reducer;
