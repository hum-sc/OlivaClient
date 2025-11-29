import { NavLink, type NavLinkProps } from "react-router";
import '../styles/components/NavItem.css';

export type NavItemProps  = {
    to: NavLinkProps["to"];
    label: string;
    badgeSmall?: boolean;
    badgeLarge?: number;
    icon?: string;
};


export default function NavItem(props: NavItemProps) {
    return (
        <NavLink to={props.to} className="navItem" >
            {({isActive}) => (
                <>
                    <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                        {props.icon}
                        {props.badgeSmall && <span className="badge small"></span>}
                        {props.badgeLarge && <span className="badge">{props.badgeLarge}</span>}
                        <span className="collapsed stateLayer"/>
                    </span>
                    <p className="labelSmall">{props.label}</p>
                    <div className="stateLayer"/>
                </>
            )}
        </NavLink>
    );
}