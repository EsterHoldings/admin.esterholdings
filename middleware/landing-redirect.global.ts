import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const path = to.path || "";
  const normalizedPath = path
    .replace(/^\/([a-z]{2})\/admin(?=\/|$)/i, "/$1")
    .replace(/^\/admin(?=\/|$)/i, "");

  if (normalizedPath === path) return;

  const nextPath = normalizedPath || "/";
  return navigateTo({
    path: nextPath,
    query: to.query,
    hash: to.hash,
  });
});
