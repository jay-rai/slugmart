import { signOut } from "firebase/auth";
import { auth } from "../config/firebase-config";

export const handleLogout = (navigate) => async () => {
    try{
        await signOut(auth);
        console.log('User signed out'); // maybe make it pretty
        navigate('/');
    } catch (error) {
        console.log('idk why we cant log you out', error);
    }
}