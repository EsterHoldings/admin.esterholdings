<template>
  <div class="clients-panel__content">
    <div
        v-for="item in props.data"
        :key="item.id"
        class="clients-panel__content_row"
    >
      <div class="user-photo" @click="handleOpenClientPage(item.id)">
        <UiImageCircle
            :twoChars="getTwoCharsByFullName(item.first_name, item.last_name)"
            :src="item.photo_url"
        />
      </div>

      <div class="row-block user-info">
        <div class="clients-panel__content_row__column-wrapper user-name-and-id">
          <div>{{ item.first_name }} {{ item.last_name }}</div>
          <div class="id">{{ item.id }}</div>
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          <span class="content">{{ item.email }}</span>
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          <span class="content">{{ item.phone }}</span>
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          <span class="content">{{ item.birthdate }}</span>
        </div>
      </div>

      <div class="row-block user-address">
        <div class="clients-panel__content_row__column-wrapper">
          {{ item.country }}
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          {{ item.city }}
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          {{ item.state }}
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          {{ item.address }}
        </div>
        <div class="clients-panel__content_row__column-wrapper">
          {{ item.postal_code }}
        </div>
      </div>

      <div class="row-block clients-panel__content_row__column-wrapper user-row-options">
        <div class="user-options">
          <div>
            <UiIconUser @click="handleOpenClientPage(item.id)"/>
          </div>
        </div>
        <div class="user-date">{{ item.created_at }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";

const emit = defineEmits(['click'])
const props = defineProps({
  data: {
    type: Array,
    default: []
  }
});

const handleOpenClientPage = (id: string) => emit('click', id);

const getTwoCharsByFullName = (firstName: string, lastName: string): string => {
  const firstInitial = firstName.charAt(0);
  const lastInitial = lastName.charAt(0);
  return `${firstInitial}${lastInitial}`;
}
</script>

<style scoped lang="scss">
.clients-panel__content {

  color: var(--ui-text-main);

  .user-row-options {
    display: flex;
    justify-content: space-between;

    .user-options {
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-stroke-ui-dark);
      border-radius: 6px;

      &:hover {
        background-color: var(--color-stroke-ui-dark);
      }
    }
  }

  @media (max-width: 800px) {
    .user-info {
      margin-top: 20px;
      width: 100%;
    }

    .clients-panel__content_row .row-block {
      padding: 0;
    }

    .user-row-options {
      flex-direction: row-reverse !important;
    }
  }

  @media (max-width: 1044px) {
    .user-address {
      margin-top: 20px;
    }
  }

  &_row {
    padding: 20px;
    border: 1px solid var(--color-stroke-ui-dark);
    margin-bottom: 20px;
    border-radius: 10px;

    display: grid;
    grid-template-columns: 60px 1fr 1fr 200px;

    @media (max-width: 800px) {
      display: flex;
      flex-direction: column;
    }

    .user-photo {
      padding-right: 20px;
    }

    .user-row-options {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-direction: column;
    }

    .row-block {
      padding: 0 10px;
    }

    .user-info {

      & > div {
        margin-bottom: 5px;
      }

      .user-name-and-id {
        display: flex;
        flex-direction: column;
      }
    }

    .user-date {
      font-size: 13px;
      font-weight: bold;
    }

    .user-address {
      font-size: 13px;
      font-weight: bold;

      & > div {
        margin-bottom: 5px;
      }
    }

    &__column-wrapper {
      display: flex;
      flex-direction: column;
      gap: 5px;

      & > .id {
        font-size: 13px;
        color: var(--color-ui-primary)
      }

      & > .content {
        font-size: 14px;
      }
    }

    &:hover {
      background-color: var(--ui-background);
    }
  }
}
</style>