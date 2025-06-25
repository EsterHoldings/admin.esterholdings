import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {useAdminAuthStore} from "~/stores/adminAuthStore";
import {useAuthStore} from "~/stores/authStore";
import {ROUTE_AUTH_REFRESH} from "~/constants/routes";

export class useApi {
    private api: AxiosInstance;

    constructor(forClient = false) {

        this.api = axios.create({
            baseURL: "https://esterholdings.website/api/",
            // baseURL: "http://127.0.0.1:8000/api/",
            // baseURL: "/api",
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });

        this.api.interceptors.request.use((config) => {
            const authStore = forClient ? useAuthStore() : useAdminAuthStore();
            let token = authStore.accessToken;

            // TODO :: Переделать все на стор
            if (forClient) {
                token = localStorage.getItem("user_access_token");
            } else {
                token = localStorage.getItem("access_token");
            }

            if (token) config.headers.Authorization = `Bearer ${token}`;

            return config;
        });

        this.api.interceptors.response.use(
            res => res,
            async err => {
                const store = useAuthStore()
                const orig = err.config

                if (
                    err.response?.status === 401 &&
                    !orig._retry &&
                    !orig.url?.endsWith(ROUTE_AUTH_REFRESH) &&
                    !orig.url?.endsWith('auth/login')
                ) {
                    orig._retry = true
                    try {
                        const {data} = await this.api.post(ROUTE_AUTH_REFRESH)
                        localStorage.setItem('refresh_token', '')
                        localStorage.setItem('refresh_token', data.access_token)
                        store.setAccessToken(data.access_token)
                        orig.headers.Authorization = `Bearer ${data.access_token}`
                        return this.api(orig)
                    } catch {
                        console.log('6');
                        await store.authLogout()
                    }
                }
                return Promise.reject(err)
            }
        )
    }

    request(config: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.api.request(config);
    }

    get(url: string, params: object = {}): Promise<AxiosResponse> {
        return this.api.get(url, {params});
    }

    post(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.post(url, data);
    }

    put(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.put(url, data);
    }

    patch(url: string, data?: object): Promise<AxiosResponse> {
        return this.api.patch(url, data);
    }

    delete(url: string, params: object = {}): Promise<AxiosResponse> {
        return this.api.delete(url, {params});
    }
}

export default useApi;
