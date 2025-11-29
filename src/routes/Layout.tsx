import { useSelector , useDispatch} from "react-redux";
import { Outlet, useNavigate } from "react-router";

import { enableDarkMode, disableDarkMode, ThemeMode } from "../features/theme/themeSlice";
import {  handleIsOfflineByUser } from "../features/online/onlineSlice";
import IconButton from "../components/IconButton";
import { type RootState } from "../store";
import "../styles/routes/Layout.css";
import FAB from "../components/FAB";
import NavItem from "../components/NavItem";
import Avatar from "../components/Avatar";
import { newNotebook } from "../hooks/useApi";

export default function Layout() {
    const isOnline = useSelector((state: RootState) => state.onlineStatus.isOnline);
    const isDarkMode = useSelector((state: RootState) => state.theme.theme);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navFAB = useSelector((state: RootState) => state.sidebar.navFAB);
    const navigate = useNavigate();

    const handleNewNotebook = async () => {
        const notebook = await newNotebook();
        if (notebook){
            navigate(`/editor/${notebook}`);
        }
    }

    const handleFABClick = async () => {
        switch (navFAB?.action){
            case "newNotebook":
                handleNewNotebook();
                break;
            case "newFile":
        }

    }
    
    return (
        <div className={`appLayout ${isDarkMode === ThemeMode.dark ? 'dark' : 'light'}`}>
            <header>
                <div className="brand">
                    <img src="/logo.svg" alt="Logo"/>
                    <h1 className="displaySmall">Oliva</h1>
                </div>
                <div className="actions">
                    {
                        isOnline ?
                        <IconButton 
                            icon="wifi"
                            label="Online"
                            onClick={()=>dispatch(handleIsOfflineByUser())}
                        />
                        :
                        <IconButton 
                            icon="wifi_off"
                            label="Offline"
                            onClick={()=>dispatch(handleIsOfflineByUser())}
                        />
                    }
                    {
                        isDarkMode === ThemeMode.dark ?
                        <IconButton 
                            icon="light_mode"
                            label="Switch to Light Mode"
                            onClick={() => dispatch(disableDarkMode())}
                        />
                        :
                        <IconButton 
                            icon="dark_mode"
                            label="Switch to Dark Mode"
                            onClick={() => dispatch(enableDarkMode())}
                        />
                    }
                    <Avatar url={user?.image_url || "/defaultAvatar.png"} size={32}/>
                </div>
            </header>
            <nav className={`large-end-round`}>
                <FAB icon={navFAB?.icon || "edit"} text={navFAB?.text || "Nueva libreta"}  color="tertiary" plain onClick={handleFABClick}/>
                <div className="routes">
                    <NavItem to="/" label="Inicio" icon="home"/>
                    <NavItem to="/files" label="Mis archivos" icon="edit"/>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}