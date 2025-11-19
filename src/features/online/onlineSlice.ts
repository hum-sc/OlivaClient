import { createSlice } from "@reduxjs/toolkit";

// Helper function to calculate online status
const calculateOnlineStatus = (isConnected: boolean, isOfflineSetedByUser: boolean): boolean => {
    return isConnected && !isOfflineSetedByUser;
};

const onlineStatusSlice = createSlice({
    name: "onlineStatus",
    initialState: {
        isOnline: true,
        isConnected: true,
        isOfflineSetedByUser: false,
    },
    reducers: {
        setConnected: (state) => {
            state.isConnected = true
            state.isOnline = calculateOnlineStatus(state.isConnected, state.isOfflineSetedByUser)
        },
        setDisconnected: (state) => {
            state.isConnected = false
            state.isOnline = calculateOnlineStatus(state.isConnected, state.isOfflineSetedByUser)
        },
        handleIsOfflineByUser(state) {
            if(state.isConnected) state.isOfflineSetedByUser = !state.isOfflineSetedByUser
            state.isOnline = calculateOnlineStatus(state.isConnected, state.isOfflineSetedByUser)
        },
        disableOfflineByUser(state) {
            state.isOfflineSetedByUser = false;
            state.isOnline = calculateOnlineStatus(state.isConnected, state.isOfflineSetedByUser);
        }
    },
});

export const { setConnected, setDisconnected, handleIsOfflineByUser, disableOfflineByUser } = onlineStatusSlice.actions;
export default onlineStatusSlice.reducer;
