import { AppReducer, type RootState } from '../store.ts'
import { configureStore } from '@reduxjs/toolkit';

function loadStoredState() {
    try{
        const serializedState = localStorage.getItem('olivaState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
}

function saveState(state: RootState) {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('olivaState', serializedState);
    } catch (err) {
        // Ignore write errors
    }
}

export default function useStoredContext() {
    const storedState = loadStoredState();
    const appStore = configureStore<RootState>({
        reducer: AppReducer,
        preloadedState: storedState,
    });
    appStore.subscribe(() => {
        saveState(appStore.getState());
    });
    return appStore;
}

export const appStore = useStoredContext();