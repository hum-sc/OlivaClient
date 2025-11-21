import { useEffect } from "react"
import { logout } from "./features/auth/authSlice";
import { userLoggedOut } from "./features/dataSync/dataSyncSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

export function Logout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        // Call the logout function from useApi
        // Redirect to home after logout
        dispatch(logout());
        dispatch(userLoggedOut());
        navigate('/');
    });
    return (
        <p className="displayMedium">Cerrando sesión...</p>
    )
}
