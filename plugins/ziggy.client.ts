import { defineNuxtPlugin } from 'nuxt/app'
import { route as ziggyRoute } from 'ziggy-js'
import { useBackendConfig } from '~/composables/useBackendConfig'

export default defineNuxtPlugin((nuxtApp) => {
  const { config } = useBackendConfig();

  // nuxtApp.provide('route', (name: string, params?: any, absolute?: boolean) => {
  //   return ziggyRoute(name, params, absolute, {
  //     ...config.value.ziggy,
  //     location: process.client ? new URL(window.location.href) : undefined
  //   })
  // });
});


// import { defineNuxtPlugin } from '#app'
// import { useZiggy } from '../composables/useZiggy'

// export default defineNuxtPlugin(async (nuxtApp) => {
//   const { loadZiggyRoutes, route } = useZiggy()

//   // Загружаем routes при инициализации приложения
//   const routes = await loadZiggyRoutes()

//   if (routes) {
//     // Здесь можно инициализировать Ziggy с загруженными маршрутами
//     // В реальном проекте нужно сохранить routes в состоянии приложения
//   }

//   return {
//     provide: {
//       ziggy: {
//         route
//       }
//     }
//   }
// })