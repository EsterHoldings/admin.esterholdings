import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useTicketPresence(ticketId: number, currentUserIsAdmin: boolean) {
    const onlineAdmins = ref<any[]>([])
    const onlineClient = ref<any | null>(null)
    const isSomeoneForMe = ref(false)

    let intervalId: any = null
    let echoChannel: any = null

    const applyPayload = (payload: any) => {
        onlineAdmins.value = payload.online_admins || []
        onlineClient.value = payload.online_client || null

        if (currentUserIsAdmin) {
            isSomeoneForMe.value = !!onlineClient.value
        } else {
            isSomeoneForMe.value = onlineAdmins.value.length > 0
        }
    }

    const ping = async () => {
        const data = await $fetch(`/api/tickets/${ticketId}/presence/ping`, {
            method: 'POST',
            credentials: 'include',
        })
        applyPayload(data)
    }

    onMounted(async () => {
        const EchoInstance: any = (window as any).Echo

        echoChannel = EchoInstance.private(`support.ticket.${ticketId}`)

        echoChannel.listen('.ticket.presence.updated', (payload: any) => {
            applyPayload(payload)
        })

        await ping()

        intervalId = setInterval(ping, 15000)
    })

    onBeforeUnmount(async () => {
        clearInterval(intervalId)

        try {
            await $fetch(`/api/tickets/${ticketId}/presence`, {
                method: 'DELETE',
                credentials: 'include',
            })
        } catch (e) {
        }

        if (echoChannel) {
            echoChannel.stopListening('.ticket.presence.updated')
            echoChannel = null
        }
    })

    return {
        onlineAdmins,
        onlineClient,
        isSomeoneForMe,
    }
}
