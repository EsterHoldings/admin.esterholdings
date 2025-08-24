import { defineNuxtPlugin } from "nuxt/app";
import mitt, { Emitter } from "mitt";

type Events = {
    [key: string]: any;
};

const eventBus: Emitter<Events> = mitt<Events>();

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide("eventBus", eventBus);
});
