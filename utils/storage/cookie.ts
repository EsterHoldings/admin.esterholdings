import {useCookie} from "nuxt/app";

export const setItem = (key: string, value: string) => {
  const cookie = useCookie(key);
  cookie.value = value;
};

export const getItem = (key: string) => {
  const cookie = useCookie(key);
  return cookie.value;
};

export const clearItem = (key: string) => {
  const cookie = useCookie(key);
  return (cookie.value = "");
};
