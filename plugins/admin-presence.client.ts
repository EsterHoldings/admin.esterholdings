import { defineNuxtPlugin, useRoute, useRuntimeConfig } from "nuxt/app";
import { watch } from "vue";
import useAppCore from "~/composables/useAppCore";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

const SESSION_KEY = "admin_presence_session_id";
const HEARTBEAT_INTERVAL_MS = 15000;

export default defineNuxtPlugin(nuxtApp => {
  if (!process.client) return;

  const appCore = useAppCore();
  const authStore = useAdminAuthStore();
  const route = useRoute();
  const runtimeConfig = useRuntimeConfig();

  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let isSending = false;

  const resolveSessionId = () => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;

    const nextId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `admin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    sessionStorage.setItem(SESSION_KEY, nextId);
    return nextId;
  };

  const updatePresenceState = (payload: any) => {
    const data = payload?.data?.data ?? payload?.data ?? null;
    if (!data || !authStore.user) return;

    authStore.setUser({
      ...authStore.user,
      is_online: Boolean(data.is_online),
      last_seen_at: typeof data.last_seen_at === "string" ? data.last_seen_at : authStore.user.last_seen_at,
    });
  };

  const ping = async (active = true) => {
    if (!authStore.isAuthenticated || isSending) return;

    isSending = true;

    try {
      const response = await appCore.adminModules.profile.presencePing({
        active,
        ttl_seconds: 30,
        session_id: resolveSessionId(),
        path: route.fullPath,
      });

      updatePresenceState(response);
    } catch (error) {
      console.error("Admin presence ping failed", error);
    } finally {
      isSending = false;
    }
  };

  const leave = async () => {
    if (!authStore.isAuthenticated) return;

    try {
      const response = await appCore.adminModules.profile.presenceLeave({
        session_id: resolveSessionId(),
      });

      updatePresenceState(response);
    } catch (error) {
      console.error("Admin presence leave failed", error);
    }
  };

  const leaveWithKeepAlive = () => {
    if (!authStore.isAuthenticated || !authStore.accessToken) return;

    try {
      void fetch(`${runtimeConfig.public.baseApi}/admin/profile/presence`, {
        method: "DELETE",
        keepalive: true,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: resolveSessionId(),
        }),
      });
    } catch (error) {
      console.error("Admin presence keepalive leave failed", error);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatTimer) return;

    heartbeatTimer = setInterval(() => {
      if (document.hidden) return;
      void ping(true);
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      void leave();
      return;
    }

    void ping(true);
  };

  const handlePageHide = () => {
    leaveWithKeepAlive();
  };

  const handleOnline = () => {
    void ping(true);
  };

  watch(
    () => authStore.isAuthenticated,
    isAuthenticated => {
      if (!isAuthenticated) {
        stopHeartbeat();
        return;
      }

      startHeartbeat();
      void ping(true);
    },
    { immediate: true }
  );

  watch(
    () => route.fullPath,
    () => {
      if (!authStore.isAuthenticated) return;
      void ping(true);
    }
  );

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("online", handleOnline);
  window.addEventListener("pagehide", handlePageHide);
});
