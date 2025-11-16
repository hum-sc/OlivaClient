import { createSlice } from "@reduxjs/toolkit";
export type NavFab = {
    text:string;
    icon: string;
    action: string;
} | null;
const initialState = {
    collapsed: false,
    navFAB: {
        text: "Ejemplo",
        icon:"",
        action:"",
    } as NavFab ,
};

const sidebarSlice = createSlice({
    name: "sidebar",
    initialState,
    reducers: {
        collapseSidebar: (state) => {
            state.collapsed = true;
        },
        expandSidebar: (state) => {
            state.collapsed = false;
        },
        toggleSidebar: (state) => {
            state.collapsed = !state.collapsed;
        },
        setActiveNav: (state, action) => {
            state.navFAB = action.payload;
        }
    },
});

export const { toggleSidebar, collapseSidebar, expandSidebar , setActiveNav} = sidebarSlice.actions;
export default sidebarSlice.reducer;
