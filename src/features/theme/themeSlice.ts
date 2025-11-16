import { createSlice } from "@reduxjs/toolkit";

export const ThemeMode = {
    light: 'light',
    dark: 'dark',
}

export const themeSlice = createSlice({
    name: "theme",
    initialState: {
        theme: ThemeMode.light,
    },
    reducers: {
        enableDarkMode: (state) => {
            state.theme = ThemeMode.dark;
        },
        disableDarkMode: (state) => {
            state.theme = ThemeMode.light;
        },
    },
});

export const { enableDarkMode, disableDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
