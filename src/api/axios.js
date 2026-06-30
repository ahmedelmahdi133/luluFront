import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
    withCredentials: true,
    timeout: 15000
});

let sessionExpiredShown = false;

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            const publicPaths = ['/', '/store', '/login', '/register'];
            const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/store/'));

            if (!isPublicPath && !sessionExpiredShown) {
                sessionExpiredShown = true;
                toast.error('Session expired. Please sign in again.', { duration: 4000, id: 'session-expired' });
                setTimeout(() => {
                    sessionExpiredShown = false;
                    window.location.href = '/login';
                }, 1500);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
