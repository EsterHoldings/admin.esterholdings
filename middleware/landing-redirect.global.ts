import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return;

  const token = localStorage.getItem("user_access_token");
  if (!token) return;

  const path = to.path || "";
  const isLanding =
    /^\/([a-z]{2}\/)?landing(\/|$)/.test(path) ||
    /^\/([a-z]{2})?\/?$/.test(path);

  if (!isLanding) return;

  const localeMatch = path.match(/^\/([a-z]{2})(\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
  return navigateTo(`${localePrefix}/dashboard`);
});
