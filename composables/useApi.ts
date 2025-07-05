import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {useAdminAuthStore} from "~/stores/adminAuthStore";
import {useAuthStore} from "~/stores/authStore";
import {
    ROUTE_ADMIN_AUTH_LOGIN,
    ROUTE_ADMIN_AUTH_REFRESH,
    ROUTE_AUTH_LOGIN,
    ROUTE_AUTH_REFRESH
} from "~/constants/routes";
import {useRuntimeConfig} from "nuxt/app";
import {ADMIN_REFRESH_TOKEN} from "~/constants/auth";
import useAppCore from "~/composables/useAppCore";

interface runtimeCfgInterface {
    baseApi: string
}

export class useApi {
    private readonly api: AxiosInstance;

    constructor(forClient = false) {
        const config = useRuntimeConfig()
        const pub = config.public as { baseApi: string }

        this.api = axios.create({
            baseURL: pub.baseApi,
            // headers: {"Content-Type": "application/json"},
            withCredentials: true,
        });

        this.api.interceptors.request.use((config) => {
            const authStore = forClient ? useAuthStore() : useAdminAuthStore();
            if (authStore.accessToken)
                config.headers.Authorization = `Bearer ${authStore.accessToken}`;

            return config;
        });

        this.api.interceptors.response.use(
            res => res,
            async err => {
                const appCore = useAppCore();
                const authStore = forClient ? useAuthStore() : useAdminAuthStore();
                const orig = err.config

                if (
                    err.response?.status === 401 &&
                    !orig._retry &&
                    !orig.url?.endsWith(ROUTE_AUTH_REFRESH) &&
                    !orig.url?.endsWith(ROUTE_AUTH_LOGIN) &&
                    !orig.url?.endsWith(ROUTE_ADMIN_AUTH_REFRESH) &&
                    !orig.url?.endsWith(ROUTE_ADMIN_AUTH_LOGIN)
                ) {
                    orig._retry = true
                    try {
                        const {data} = forClient ? await appCore.auth.doRefresh() : await appCore.adminModules.auth.doRefresh();
                        authStore.setAccessToken(data.access_token)
                        orig.headers.Authorization = `Bearer ${data.access_token}`
                        return this.api(orig)
                    } catch {
                        await authStore.authLogout()
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
