import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";

export const handleLogout = (navigate) => async () => {
    try{
        await signOut(auth);
        console.log('User signed out'); // maybe make it pretty
        navigate('/');
    } catch (error) {
        console.log('idk why we cant log you out', error);
    }
}