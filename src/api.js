import axios from 'axios';

export const BASE_URL = 'http://172.20.10.194:8000/api/v2';
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('meeting_room_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response } = error;

        if (response.status === 401) {
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);

const redirectToLogin = () => {
    window.location.href = '/';
    localStorage.removeItem('meeting_room_access_token')
};

export default api;
