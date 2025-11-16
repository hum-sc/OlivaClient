import { logout } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { getFile } from "../hooks/useApi";
import '../styles/Avatar.css';
import Button from "./Button";
export type AvatarProps = {
    url: string;
    size?: number;
};
export default function Avatar({ url, size }: AvatarProps) {
    const dispatch = useDispatch();
    const token = useSelector((state: any) => state.auth.token);
    const [isFocused, setIsFocused] = useState(false);
    
    const [finalUrl, setFinalUrl] = useState("/defaultAvatar.png");
    useEffect(() => {
        const fetchImage = async () => {
            const image = await getFile( token, url);
            setFinalUrl(URL.createObjectURL(image));
        };
        fetchImage();
    }, [url, token]);
    return (
        <div  className="avatarContainer" onMouseLeave={()=>setIsFocused(false)} >
            <img src={finalUrl} alt="Avatar" style={{ width: size, height: size }}  onMouseEnter={()=>setIsFocused(true)}  />
            {isFocused && <div className="avatarTooltip" onMouseLeave={()=>setIsFocused(false)}>
                <Button type="default" color="outlined" shape="rounded" onClick={()=> dispatch(logout())} text="Cerrar sesión" />
            </div>
            }
        </div>
    );
}