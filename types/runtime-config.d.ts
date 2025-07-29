import type { PublicRuntimeConfig as NuxtPublicRuntimeConfig } from 'nuxt/schema';

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    recaptchaSecretKey: string
  }

  interface PublicRuntimeConfig extends NuxtPublicRuntimeConfig {
    baseApi: string
    baseUrl: string
    cliFacebook: string
    cliGoogle: string
    cliLinkIdIn: string
    reCaptchaSiteKey: string
  }
}

interface ReCaptchaInstance {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha: ReCaptchaInstance
  }
}

export { }