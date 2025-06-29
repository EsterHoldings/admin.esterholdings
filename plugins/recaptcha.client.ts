export default defineNuxtPlugin(() => {
    const {public: pub} = useRuntimeConfig()
    const SITE_KEY = pub.reCaptchaSiteKey

    const waitForGrecaptcha = (): Promise<typeof grecaptcha> => {
        return new Promise((resolve) => {
            const check = () => {
                if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
                    resolve(window.grecaptcha)
                } else {
                    setTimeout(check, 50)
                }
            }
            check()
        })
    }

    const executeRecaptcha = async (action: string): Promise<boolean> => {
        try {
            const grecaptcha = await waitForGrecaptcha()

            const token = await new Promise<string>((resolve, reject) => {
                grecaptcha.ready(() => {
                    grecaptcha.execute(SITE_KEY, {action})
                        .then(resolve)
                        .catch(reject)
                })
            })

            const response = await $fetch('http://localhost:8000/api/verify-recaptcha', {
                method: 'POST',
                body: {
                    token,
                    action,
                },
            })

            
            return response.success === true && response.score >= 0.5
        } catch (err) {
            console.error('reCAPTCHA error:', err)
            return false
        }
    }

    return {
        provide: {
            recaptcha: executeRecaptcha,
        },
    }
})