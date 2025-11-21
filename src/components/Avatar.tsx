import { logout } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getFile, logoutUser } from "../hooks/useApi";
import '../styles/Avatar.css';
import Button from "./Button";
import { userLoggedOut } from "../features/dataSync/dataSyncSlice";
import type { RootState } from "../store";
export type AvatarProps = {
    url: string;
    size?: number;
};
export default function Avatar({ url, size }: AvatarProps) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [isFocused, setIsFocused] = useState(false);
    
    const [finalUrl, setFinalUrl] = useState("/defaultAvatar.png");
    useEffect(() => {
        const fetchImage = async () => {
            const image = await getFile(url);
            if (image) setFinalUrl(URL.createObjectURL(image!));
        };
        fetchImage();
    }, [isAuthenticated, url]);
    return (
        <div  className="avatarContainer" onMouseLeave={()=>setIsFocused(false)} >
            <img src={finalUrl} alt="Avatar" style={{ width: size, height: size }}  onMouseEnter={()=>setIsFocused(true)}  />
            {isFocused && <div className="avatarTooltip" onMouseLeave={()=>setIsFocused(false)}>
                <Button type="default" color="outlined" shape="rounded" onClick={()=> {
                    logoutUser();
                    }} text="Cerrar sesión" />
            </div>
            }
        </div>
    );
}