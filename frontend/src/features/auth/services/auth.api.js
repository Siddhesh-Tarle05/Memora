import axios from 'axios';

const Api=axios.create({
     baseURL: `${import.meta.env.VITE_API_URL}/api/auth`, 
    withCredentials:true
})
export async function register({email,name,password}) {
   const response= await Api.post('/register',{email,name,password})
    return response.data
}
export async function login({email,password}) {
    const response=await Api.post('/login',{email,password})
    return response.data
}
export async function getMe() {
    const response = await Api.get('/getme');
    return response.data;
}
export async function logout() {
    const response = await Api.post('/logout');
    return response.data;
}