<template>
  <div class="text-[var(--ui-text-main)] md:flex-row">

    <div class="w-full mb-10">
      <div class="mb-5 flex items-start justify-between">
        <UiTextH5># Verification Status</UiTextH5>

        <button
            type="button"
            @click="handleRefreshDocuments"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
            :aria-label="t('Refresh')"
        >
          <UiIconUpdate :class="{ 'animate-spin': isLoading }"/>
        </button>
      </div>

      <PanelDefault class="p-5 relative">
        <div
            v-if="isLoading"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--ui-background)]/40 backdrop-blur-sm"
        >
          <UiIconSpinnerDefault/>
        </div>

        <div class="relative">
          <ul class="divide-y divide-[var(--color-stroke-ui-light)]">
            <li
                v-for="item in items"
                :key="item.key"
                class="grid grid-cols-[1fr,auto] items-center gap-3 py-3"
            >
              <div class="min-w-0">
                <div class="flex items-center justify-between w-min">
                  <div class="font-medium truncate">{{ item.title }}</div>
                  &nbsp;
                  <div class="text-sm text-[var(--ui-text-secondary)] truncate" v-if="item.subtitle">({{ item.subtitle }})</div>
                </div>

                <!-- comment -->
                <div v-if="item.comment?.value" class="col-span-2 mt-2">
                  <div class="text-xs font-semibold mb-1 opacity-80">Comment</div>
                  <UiTextSmall class="!text-[var(--ui-primary-accent)]">{{ item.comment.value }}</UiTextSmall>
                </div>
              </div>

              <!-- right: status + icon -->
              <div class="flex items-center justify-end gap-1">
                <component
                    :is="iconByStatus(item.status.value)"
                    class="shrink-0"
                />
                <span
                    class="rounded-md text-xs font-medium"
                    :class="pillClass(item.status.value)"
                >
                {{ textByStatus(item.status.value) }}
              </span>
              </div>
            </li>
          </ul>
        </div>
      </PanelDefault>
    </div>

    <div class="w-full">
      <UiTextH5 class="mb-5"># Verification History</UiTextH5>

      <PanelDefault class="relative">
        <div v-if="isLoading" class="absolute inset-0 z-10 flex items-center justify-center rounded-xl
        bg-[var(--ui-background)]/40 backdrop-blur-sm">
          <UiIconSpinnerDefault/>
        </div>

        <div class="overflow-hidden rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-ui-primary)]">
            <tr class="text-left">
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Status</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-stroke-ui-light)]">
            <tr v-for="row in historyRows" :key="row.id" class="hover:bg-[var(--color-stroke-ui-light)]/20">
              <td class="px-4 py-3">{{ row.name }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ row.date }}</td>
              <td class="px-4 py-3">
                <span
                    class="inline-flex items-center justify-start gap-1 rounded-md text-xs font-medium"
                    :class="pillClass(row.status)"
                >
                  <component :is="iconByStatus(row.status)"/>
                  <span class="whitespace-nowrap">{{ textByStatus(row.status) }}</span>
                </span>
              </td>
            </tr>
            </tbody>
          </table>
          <UiTextSmall class="flex items-center justify-center h-[40px] w-full cursor-pointer">Load more...</UiTextSmall>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref, computed} from 'vue'
import {useI18n} from 'vue-i18n'

import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import UiTextH5 from '~/components/ui/UiTextH5.vue'
import UiBadge from '~/components/ui/UiBadge.vue'
import UiTextSmall from '~/components/ui/UiTextSmall.vue'

import UiIconUpdate from '~/components/ui/UiIconUpdate.vue'
import UiIconWarning from '~/components/ui/UiIconWarning.vue'
import UiIconSuccess from '~/components/ui/UiIconSuccess.vue'
import UiIconFailed from '~/components/ui/UiIconFailed.vue'
import UiIconSpinnerDefault from '~/components/ui/UiIconSpinnerDefault.vue'

import useAppCore from '~/composables/useAppCore'
import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";

const {t} = useI18n({useScope: 'global'})

const appCore = useAppCore()
const isLoading = ref(false)

let verificationRequestData = reactive<Record<string, any>>({})

const addressStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const documentsStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const depositStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const emailStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const infoStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const photoStatus = ref<'pending' | 'approved' | 'rejected'>('pending')

const addressComment = ref<string>('')
const documentsComment = ref<string>('')
const depositComment = ref<string>('')
const emailComment = ref<string>('')
const infoComment = ref<string>('')
const photoComment = ref<string>('')

// Left list config (підпис як на скріншоті)
const items = computed(() => ([
  {key: 'email', title: 'Email', subtitle: 'Confirm your email', status: emailStatus, comment: emailComment},
  {key: 'photo', title: 'Photo', subtitle: 'Upload photo', status: photoStatus, comment: photoComment},
  {key: 'address', title: 'Adress', subtitle: '', status: addressStatus, comment: addressComment},
  {key: 'documents', title: 'Document', subtitle: '', status: documentsStatus, comment: documentsComment},
  {
    key: 'deposit',
    title: '1st Deposit',
    subtitle: 'Make a payment to verify the 1st deposit',
    status: depositStatus,
    comment: depositComment
  },
  {key: 'profile', title: 'Profile', subtitle: '', status: infoStatus, comment: infoComment},
]))

// History table rows (спробуємо взяти з API, інакше — приклади як на скріні)
const historyRows = computed(() => {
  const apiRows = verificationRequestData?.history as Array<any> | undefined
  if (Array.isArray(apiRows) && apiRows.length) {
    return apiRows.map((r, i) => ({
      id: r.id ?? i,
      name: r.name ?? r.message ?? '',
      date: r.date ?? r.created_at ?? '',
      status: (r.status ?? 'pending') as 'approved' | 'pending' | 'rejected'
    }))
  }

  return [
    {id: 1, name: 'Sent verification mail.', date: '13.07.25 13:21', status: 'approved'},
    {id: 2, name: 'You requested profile photo verification.', date: '10.07.25 21:46', status: 'pending'},
    {id: 3, name: 'Your profile photo was automatic approved.', date: '04.07.25 12:50', status: 'approved'},
    {id: 4, name: 'Requested user data verification.', date: '28.06.25 07:27', status: 'pending'},
    {id: 5, name: 'Your user data was approved.', date: '21.06.25 16:18', status: 'approved'},
    {id: 6, name: 'Your user data was rejected.', date: '21.06.25 16:18', status: 'rejected'},
  ] as Array<{ id: number; name: string; date: string; status: 'approved' | 'pending' | 'rejected' }>
})

// Helpers: icon, text, classes
const iconByStatus = (s: 'approved' | 'pending' | 'rejected') =>
    s === 'approved' ? UiIconSuccessFull : s === 'pending' ? UiIconWarningFull : UiIconDangerFull

const textByStatus = (s: 'approved' | 'pending' | 'rejected') =>
    s === 'approved' ? 'Confirmed' : s === 'pending' ? 'In progress' : 'Canceled'

const pillClass = (s: 'approved' | 'pending' | 'rejected') => ({
  'border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10': s === 'approved',
  'border-[var(--color-warning)]/30 text-[var(--color-warning)] bg-[var(--color-warning)]/10': s === 'pending',
  'border-[var(--color-danger)]/30  text-[var(--color-danger)]  bg-[var(--color-danger)]/10': s === 'rejected',
})

const loadVerificationData = async () => {
  isLoading.value = true
  try {
    const response = await appCore.verifications.get()
    Object.assign(verificationRequestData, response.data.data)

    addressStatus.value = verificationRequestData['address']?.['verification_status'] ?? addressStatus.value
    emailStatus.value = verificationRequestData['email']?.['verification_status'] ?? emailStatus.value
    photoStatus.value = verificationRequestData['photo']?.['verification_status'] ?? photoStatus.value
    infoStatus.value = verificationRequestData['info']?.['verification_status'] ?? infoStatus.value
    documentsStatus.value = verificationRequestData['documents']?.['verification_status'] ?? documentsStatus.value
    depositStatus.value = verificationRequestData['deposit']?.['verification_status'] ?? depositStatus.value

    addressComment.value = verificationRequestData['address']?.['comment'] ?? ''
    emailComment.value = verificationRequestData['email']?.['comment'] ?? ''
    photoComment.value = verificationRequestData['photo']?.['comment'] ?? ''
    infoComment.value = verificationRequestData['info']?.['comment'] ?? ''
    documentsComment.value = verificationRequestData['documents']?.['comment'] ?? ''
    depositComment.value = verificationRequestData['deposit']?.['comment'] ?? ''
  } finally {
    setTimeout(() => (isLoading.value = false), 400)
  }
}

const handleRefreshDocuments = async () => {
  await loadVerificationData()
}

onMounted(loadVerificationData)
</script>
