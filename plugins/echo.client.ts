import Echo from "laravel-echo";
import type EchoType from "laravel-echo";
import Pusher from "pusher-js";
import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { ADMIN_ACCESS_TOKEN, USER_ACCESS_TOKEN } from "~/constants/auth";
import { ROUTE_ADMIN_AUTH_REFRESH, ROUTE_AUTH_REFRESH } from "~/constants/routes";

declare global {
  interface Window {
    Pusher: any;
    Echo: EchoType<any>;
  }
}

const sanitizePort = (value: string | number | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveOrigin = (candidate: string | undefined): string => {
  if (!candidate || candidate.trim() === "") {
    return window.location.origin;
  }

  try {
    const resolved = new URL(candidate, window.location.origin);
    return resolved.origin;
  } catch {
    return window.location.origin;
  }
};

const resolveAuthToken = (preferAdminAuth: boolean): string => {
  if (preferAdminAuth) {
    return localStorage.getItem(ADMIN_ACCESS_TOKEN) || localStorage.getItem("access_token") || "";
  }

  return localStorage.getItem(USER_ACCESS_TOKEN) || "";
};

const resolveXsrfToken = (): string => {
  return document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1] ?? "";
};

const withTrailingSlash = (value: string): string => (value.endsWith("/") ? value : `${value}/`);

const resolveApiBase = (candidate: string | undefined): string => {
  if (!candidate || candidate.trim() === "") {
    return `${window.location.origin}/api`;
  }

  try {
    const resolved = new URL(candidate, window.location.origin);
    return resolved.toString().replace(/\/+$/, "");
  } catch {
    return `${window.location.origin}/api`;
  }
};

const resolveRefreshEndpoint = (apiBase: string, preferAdminAuth: boolean): string => {
  const relativePath = preferAdminAuth ? ROUTE_ADMIN_AUTH_REFRESH : ROUTE_AUTH_REFRESH;
  return new URL(relativePath.replace(/^\/+/, ""), withTrailingSlash(apiBase)).toString();
};

const extractAccessToken = (payload: any): string => {
  return String(payload?.access_token ?? payload?.data?.access_token ?? "");
};

const persistAccessToken = (preferAdminAuth: boolean, token: string) => {
  if (!token) return;

  if (preferAdminAuth) {
    localStorage.setItem(ADMIN_ACCESS_TOKEN, token);
    // keep backward compatibility with legacy admin token key
    localStorage.removeItem("access_token");
    return;
  }

  localStorage.setItem(USER_ACCESS_TOKEN, token);
};

export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public as {
    hostBase?: string;
    baseApi?: string;
    reverbKey?: string;
    reverbHost?: string;
    reverbPort?: string | number;
    reverbScheme?: string;
  };

  const authOrigin = resolveOrigin(cfg.hostBase || cfg.baseApi);
  const apiBase = resolveApiBase(cfg.baseApi);
  const authEndpoint = `${authOrigin}/broadcasting/auth`;

  const scheme = (cfg.reverbScheme || window.location.protocol.replace(":", "") || "http").toLowerCase();
  const forceTLS = scheme === "https";
  const port = sanitizePort(cfg.reverbPort, forceTLS ? 443 : 80);
  const transport = forceTLS ? "wss" : "ws";
  let refreshInFlight: Promise<string | null> | null = null;

  const refreshAccessToken = async (preferAdminAuth: boolean): Promise<string | null> => {
    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const xsrf = resolveXsrfToken();
        const refreshEndpoint = resolveRefreshEndpoint(apiBase, preferAdminAuth);
        const response = await fetch(refreshEndpoint, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...(xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {}),
          },
        });

        if (!response.ok) {
          return null;
        }

        const payload = await response.json().catch(() => null);
        const refreshedToken = extractAccessToken(payload);
        if (!refreshedToken) {
          return null;
        }

        persistAccessToken(preferAdminAuth, refreshedToken);
        return refreshedToken;
      } catch {
        return null;
      }
    })();

    try {
      return await refreshInFlight;
    } finally {
      refreshInFlight = null;
    }
  };

  const authorizeChannel = async (socketId: string, channelName: string) => {
    const xsrf = resolveXsrfToken();

    const requestAuth = async (currentToken: string) =>
      fetch(authEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
          ...(xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {}),
        },
        body: JSON.stringify({
          socket_id: socketId,
          channel_name: channelName,
        }),
      });

    const authorizeWithContext = async (preferAdminAuth: boolean) => {
      let token = resolveAuthToken(preferAdminAuth);
      let response = await requestAuth(token);

      if (response.status === 401) {
        const refreshedToken = await refreshAccessToken(preferAdminAuth);
        token = refreshedToken ?? resolveAuthToken(preferAdminAuth);
        response = await requestAuth(token);
      }

      return response;
    };

    // In this app `/admin` prefix is stripped from URLs, so path-based admin detection is unreliable.
    // Prefer admin auth first and fallback to client auth only when needed.
    let response = await authorizeWithContext(true);
    if (response.status === 401 || response.status === 403) {
      response = await authorizeWithContext(false);
    }

    return response;
  };

  window.Pusher = Pusher;

  const echo = new Echo({
    broadcaster: "reverb",
    key: cfg.reverbKey,
    wsHost: cfg.reverbHost || window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: [transport],
    disableStats: true,
    activityTimeout: 30_000,
    pongTimeout: 6_000,
    unavailableTimeout: 5_000,
    authEndpoint,
    withCredentials: true,
    authorizer: (channel: any) => ({
      authorize: async (socketId: string, callback: (error: boolean, data: any) => void) => {
        try {
          const response = await authorizeChannel(socketId, channel.name);

          if (!response.ok) {
            const errorBody = await response.text();
            callback(true, errorBody || `Broadcast auth failed: ${response.status}`);
            return;
          }

          const data = await response.json();
          callback(false, data);
        } catch (error) {
          callback(true, error);
        }
      },
    }),
  });

  window.Echo = echo;

  return { provide: { echo } };
});
