import FAB from "./FAB";
import NavItem from "./NavItem";
import type { NavFab } from "../features/sidebar/sidebarSlice";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function SideBar({ navFAB, handleFABClick }: { navFAB: NavFab; handleFABClick: () => Promise<void>; }) {
    // Media query for set as not expanded
    const collapsed = useSelector((selector:RootState) => selector.sidebar.collapsed);
    let [width, setWidth] = useState(window.innerWidth);
    const isCollapsed =useMemo(()=>{
        return window.matchMedia("(max-width: 1023px)").matches || collapsed;
    }, [window.innerWidth, collapsed]);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return <nav className={`large-end-round ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <FAB icon={navFAB?.icon || "edit"} text={navFAB?.text || "Nueva libreta"} color="tertiary" plain onClick={handleFABClick} />
        <div className="routes">
            <NavItem to="/" label="Inicio" icon="home" />
            <NavItem to="/files" label="Mis archivos" icon="files" />
        </div>
    </nav>;
}
