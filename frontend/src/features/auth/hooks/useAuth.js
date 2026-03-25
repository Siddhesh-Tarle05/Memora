import { useDispatch } from "react-redux";
import { login, register } from "../services/auth.api";
import { setUser,setError,setLoading } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, name, password }) {
        try {
            dispatch(setLoading(true));

            const data = await register({ name, email, password });

            dispatch(setUser(data.user)); 
            return { success: true };
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || "Registration failed")
            );
            return { success: false, error };
        } finally {
            dispatch(setLoading(false)); 
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));

            const data = await login({ email, password });
             console.log(data)
            dispatch(setUser(data.user));
            return { success: true };
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || "Login failed")
            );
            return { success: false, error };
        } finally {
            dispatch(setLoading(false));
        }
    }

    return { handleLogin ,handleRegister};
}