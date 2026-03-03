<template>
  <div
    class="verifications-panel"
    :class="
      viewMode !== 'table'
        ? viewMode === 'full'
          ? 'verifications-panel--items grid-cols-1'
          : 'verifications-panel--items grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        : ''
    ">
    <TableMain v-if="viewMode === 'table'">
      <template #thead>
        <tr>
          <th class="px-4 py-2 text-left font-normal w-[72px]">ID</th>
          <th class="px-4 py-2 text-left font-normal">User</th>
          <th class="px-4 py-2 text-left font-normal">Updated</th>
          <th class="px-4 py-2 text-left font-normal">Status</th>
        </tr>
      </template>
      <template #tbody>
        <tr
          v-for="verificationRequest in verificationRequests"
          :key="verificationRequest.id"
          class="border-t border-[var(--color-stroke-ui-dark)] hover:bg-[var(--color-stroke-ui-dark)]"
          @click="handleClickVerificationRequest(verificationRequest['user']['id'])">
          <td class="px-4 py-3">
            <UiImageCircle
              :src="verificationRequest['user']['photo_url']"
              :two-chars="verificationRequest['user']['initials']" />
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-col">
              <span class="font-medium">
                {{ verificationRequest["user"]["first_name"] }} {{ verificationRequest["user"]["last_name"] }}
              </span>
              <span class="text-[12px] text-[var(--ui-text-secondary)]">
                {{ verificationRequest["user"]["email"] }}
              </span>
            </div>
          </td>
          <td class="px-4 py-3 text-[var(--ui-text-secondary)]">{{ verificationRequest["updated_at_human"] }}...</td>
          <td class="px-4 py-3">
            <VerificationActions :status="verificationRequest['state']" />
          </td>
        </tr>
      </template>
    </TableMain>

    <template v-else>
      <div
        class="verification-card"
        v-for="verificationRequest in verificationRequests"
        :key="verificationRequest.id"
        @click="handleClickVerificationRequest(verificationRequest['user']['id'])">
        <div class="flex items-center gap-3">
          <UiImageCircle
            :src="verificationRequest['user']['photo_url']"
            :two-chars="verificationRequest['user']['initials']" />
          <div class="min-w-0">
            <div class="font-semibold truncate">
              {{ verificationRequest["user"]["first_name"] }} {{ verificationRequest["user"]["last_name"] }}
            </div>
            <div class="text-[12px] text-[var(--ui-text-secondary)] truncate">
              {{ verificationRequest["user"]["email"] }}
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between text-sm text-[var(--ui-text-secondary)]">
          <span>{{ verificationRequest["updated_at_human"] }}...</span>
          <VerificationActions :status="verificationRequest['state']" />
        </div>
      </div>
    </template>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

  import useAppCore from "~/composables/useAppCore";
  import { navigateTo } from "nuxt/app";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";
  import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
  import TableMain from "~/components/block/tables/TableMain.vue";

  const appCore = useAppCore();

  const isLoading = ref(false);
  const emit = defineEmits(["loading"]);
  const perPage = ref(5);
  const page = ref(1);
  const totalRows = ref(0);
  const searchFields = ref(["id", "user_id", "data", "state", "created_at", "updated_at"]);
  const props = defineProps<{
    searchFilter: string;
    viewMode?: "table" | "cards" | "full";
  }>();

  const viewMode = computed(() => props.viewMode ?? "table");

  const verificationRequests = reactive([]);

  const loadData = async () => {
    isLoading.value = true;
    emit("loading", true);
    const params = {
      page: page.value,
      perPage: perPage.value,
      searchFilter: props.searchFilter,
      searchFields: searchFields.value,
    };

    const response = await appCore.adminModules.verificationRequests.getAll(params);
    totalRows.value = response.data.data.total;

    let responseVerificationRequestsData = response.data.data.data;

    isLoading.value = false;
    emit("loading", false);
    verificationRequests.splice(0, verificationRequests.length, ...responseVerificationRequestsData);
  };

  const handleChangePerPage = async (value: number) => {
    page.value = 1;
    perPage.value = value;
    await loadData();
  };

  const handleChangePage = async (value: number) => {
    page.value = value;
    await loadData();
  };

  watch(
    () => props.searchFilter,
    async () => {
      page.value = 1;
      await loadData();
    }
  );

  const handleClickVerificationRequest = (id: string) => {
    navigateTo(`/clients/${id}?tab=1&verificationTab=client`);
  };

  onMounted(async () => {
    isLoading.value = true;
    emit("loading", true);
    await loadData();
    // useEventBus.on("loadDataForAdmins", loadData);
  });

  defineExpose({
    reload: async () => {
      isLoading.value = true;
      emit("loading", true);
      await loadData();
    },
  });
</script>

<style lang="scss" scoped>
  .verifications-panel {
    &--items {
      display: grid;
      gap: 12px;
    }
  }

  .verification-card {
    background: var(--ui-background-panel);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 12px;
    padding: 12px 14px;
    transition: background-color 0.2s ease;
  }

  .verification-card:hover {
    background: var(--color-stroke-ui-dark);
  }

  .add-btn {
    background-color: var(--color-stroke-ui-dark);
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.1s;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      opacity: 0.5;
    }
  }
</style>
