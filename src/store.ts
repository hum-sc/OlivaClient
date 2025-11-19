import { configureStore } from "@reduxjs/toolkit";
//import counterReducer from "./features/counter/counterSlice";
//import onlineReducer from "./features/online/onlineSlice";
import themeReducer from "./features/theme/themeSlice";
import sidebarReducer from "./features/sidebar/sidebarSlice";
import authReducer from "./features/auth/authSlice";
import onlineStatusReducer from "./features/online/onlineSlice";
import editorReducer from "./features/editor/editorSlice";
import dataSyncReducer from "./features/dataSync/dataSyncSlice";
export type RootState = {
    theme: ReturnType<typeof themeReducer>;
    sidebar: ReturnType<typeof sidebarReducer>;
    auth: ReturnType<typeof authReducer>;
    onlineStatus: ReturnType<typeof onlineStatusReducer>;
    editor: ReturnType<typeof editorReducer>;
    dataSync: ReturnType<typeof dataSyncReducer>;
}

export const AppReducer = {
    theme: themeReducer,
    sidebar: sidebarReducer,
    auth: authReducer,
    onlineStatus: onlineStatusReducer,
    editor: editorReducer,
    dataSync: dataSyncReducer
};
export default configureStore<RootState>({
    reducer: AppReducer
});

